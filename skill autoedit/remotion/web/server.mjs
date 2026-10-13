import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import {
  getAllowedFileType,
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  validateJobOptions,
} from "./validation.mjs";

const webDir = path.dirname(fileURLToPath(import.meta.url));
const remotionDir = path.resolve(webDir, "..");
const entryPoint = path.join(remotionDir, "src", "web-index.ts");
const port = Number(process.env.PORT || 3000);
const appPassword = process.env.APP_PASSWORD || "";
const maxActiveJobs = 3;
const jobRetentionMs = 60 * 60 * 1000;
const jobs = new Map();
const queue = [];
let bundleUrl;
let runtimeDir;
let activeJobs = 0;
let processingQueue = false;

const allowedMimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const storage = multer.diskStorage({
  destination(req, _file, callback) {
    callback(null, path.join(runtimeDir, req.uploadId, "source"));
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES,
    fields: 3,
    fieldSize: 100,
  },
  fileFilter(_req, file, callback) {
    if (!getAllowedFileType(file.originalname, file.mimetype)) {
      callback(new Error("Chỉ nhận ảnh JPG/PNG/WebP và video MP4/MOV/WebM."));
      return;
    }
    callback(null, true);
  },
});

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getJobResponse(job) {
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    error: job.error,
    createdAt: job.createdAt,
    outputs: job.outputs.map((output) => ({
      index: output.index,
      status: output.status,
      downloadUrl: output.status === "done"
        ? `/api/jobs/${job.id}/download/${output.index}`
        : undefined,
    })),
  };
}

function sendUploadError(res, error) {
  if (error instanceof multer.MulterError) {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Mỗi tệp không được vượt quá 25 MB."
      : `Yêu cầu tải tệp không hợp lệ (${error.code}).`;
    res.status(status).json({ error: message });
    return;
  }
  res.status(400).json({ error: error.message || "Không thể nhận tệp tải lên." });
}

async function removeJobFiles(directory, context) {
  try {
    await rm(directory, { recursive: true, force: true });
  } catch (error) {
    console.error(`[${context}] cleanup failed`, error);
  }
}

async function renderJob(job) {
  job.status = "rendering";
  job.updatedAt = Date.now();
  const baseUrl = `http://127.0.0.1:${port}`;
  let fileOffset = 0;
  for (const output of job.outputs) {
    output.status = "rendering";
    const groupSize = job.options.groupSizes[output.index - 1];
    const items = job.files
      .slice(fileOffset, fileOffset + groupSize)
      .map((file) => ({
        src: `${baseUrl}/api/jobs/${job.id}/assets/${encodeURIComponent(file.filename)}?token=${job.assetToken}`,
        type: file.type,
        durationInSeconds: job.options.duration,
        fit: "cover",
        muted: false,
      }));
    fileOffset += groupSize;

    const inputProps = {
      width: job.options.width,
      height: job.options.height,
      fps: 24,
      backgroundColor: "#101014",
      items,
      srcMode: "url",
    };
    const outputLocation = path.join(
      job.directory,
      `skilledit-video-${String(output.index).padStart(2, "0")}.mp4`,
    );

    const composition = await selectComposition({
      serveUrl: bundleUrl,
      id: "WebSlideshow",
      inputProps,
    });

    await renderMedia({
      composition,
      serveUrl: bundleUrl,
      codec: "h264",
      outputLocation,
      inputProps,
      concurrency: 1,
      crf: 28,
      pixelFormat: "yuv420p",
      chromiumOptions: { gl: "swiftshader" },
      onProgress({ progress }) {
        job.progress = Math.max(
          0,
          Math.min(1, (output.index - 1 + progress) / job.outputs.length),
        );
        job.updatedAt = Date.now();
      },
    });

    output.outputLocation = outputLocation;
    output.status = "done";
  }

  job.progress = 1;
  job.status = "done";
}

async function processQueue() {
  if (processingQueue) return;
  processingQueue = true;
  try {
    while (queue.length > 0) {
      const jobId = queue.shift();
      const job = jobs.get(jobId);
      if (!job) continue;

      try {
        await renderJob(job);
      } catch (error) {
        console.error(`[job ${job.id}] render failed`, error);
        const currentOutput = job.outputs.find((output) => output.status === "rendering");
        if (currentOutput) currentOutput.status = "failed";
        const completedOutputs = job.outputs.filter((output) => output.status === "done").length;
        job.status = "failed";
        job.error = completedOutputs > 0
          ? `Dừng ở video ${completedOutputs + 1}. Đã render xong ${completedOutputs}/${job.outputs.length} video. Bạn vẫn có thể tải các video đã hoàn tất.`
          : "Không render được. Kiểm tra định dạng media rồi thử lại.";
      } finally {
        activeJobs -= 1;
        job.updatedAt = Date.now();
      }
    }
  } finally {
    processingQueue = false;
  }
}

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(webDir, "public"), { index: "index.html" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const renderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, rendererReady: Boolean(bundleUrl) });
});

app.post("/api/session", loginLimiter, (req, res) => {
  if (!appPassword || (typeof req.body?.password === "string" && safeEqual(req.body.password, appPassword))) {
    res.json({ ok: true });
    return;
  }
  res.status(401).json({ error: "Mật khẩu không đúng." });
});

app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path === "/session") {
    next();
    return;
  }
  if (req.method === "GET" && /^\/jobs\/[^/]+\/assets\/[^/]+$/.test(req.path)) {
    next();
    return;
  }
  if (!appPassword) {
    next();
    return;
  }

  const authorization = req.get("authorization") || "";
  const suppliedPassword = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  if (!safeEqual(suppliedPassword, appPassword)) {
    res.status(401).json({ error: "Phiên đăng nhập hết hạn." });
    return;
  }
  next();
});

app.get("/api/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Không tìm thấy tác vụ hoặc tác vụ đã hết hạn." });
    return;
  }
  res.json(getJobResponse(job));
});

app.post("/api/jobs", renderLimiter, async (req, res) => {
  const uploadId = randomUUID();
  const uploadDirectory = path.join(runtimeDir, uploadId, "source");
  req.uploadId = uploadId;

  try {
    await mkdir(uploadDirectory, { recursive: true });
  } catch (error) {
    console.error("Unable to prepare upload directory", error);
    res.status(500).json({ error: "Không chuẩn bị được nơi nhận tệp." });
    return;
  }

  upload.array("files", MAX_FILES)(req, res, async (uploadError) => {
    if (uploadError) {
      await removeJobFiles(path.join(runtimeDir, uploadId), `upload ${uploadId}`);
      sendUploadError(res, uploadError);
      return;
    }

    const files = req.files || [];
    let options;
    try {
      options = validateJobOptions(req.body, files.length);
    } catch (error) {
      await removeJobFiles(path.join(runtimeDir, uploadId), `upload ${uploadId}`);
      res.status(400).json({ error: error.message });
      return;
    }

    if (activeJobs >= maxActiveJobs) {
      await removeJobFiles(path.join(runtimeDir, uploadId), `upload ${uploadId}`);
      res.status(429).json({ error: "Hàng đợi đang đầy. Hãy thử lại sau khi có video hoàn tất." });
      return;
    }

    const id = uploadId;
    const directory = path.join(runtimeDir, id);
    try {
      const storedFiles = files.map((file) => ({
        filename: file.filename,
        path: file.path,
        type: getAllowedFileType(file.originalname, file.mimetype),
        mimeType: allowedMimeTypes[path.extname(file.originalname).toLowerCase()],
      }));
      const job = {
        id,
        directory,
        files: storedFiles,
        options,
        outputs: Array.from({ length: options.videoCount }, (_, index) => ({
          index: index + 1,
          status: "queued",
          outputLocation: null,
        })),
        assetToken: randomBytes(32).toString("hex"),
        status: "queued",
        progress: 0,
        error: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      jobs.set(id, job);
      queue.push(id);
      activeJobs += 1;
      res.status(202).json(getJobResponse(job));
      void processQueue();
    } catch (error) {
      console.error("Unable to queue render job", error);
      await removeJobFiles(path.join(runtimeDir, uploadId), `upload ${uploadId}`);
      res.status(500).json({ error: "Không thể đưa video vào hàng đợi." });
    }
  });
});

app.get("/api/jobs/:id/assets/:filename", async (req, res) => {
  const job = jobs.get(req.params.id);
  const asset = job?.files.find((file) => file.filename === req.params.filename);
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!job || !asset || !safeEqual(token, job.assetToken)) {
    res.status(404).end();
    return;
  }

  try {
    await stat(asset.path);
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "Content-Type": asset.mimeType,
    });
    const stream = createReadStream(asset.path);
    stream.on("error", () => {
      if (!res.headersSent) res.status(404).end();
      else res.destroy();
    });
    stream.pipe(res);
  } catch {
    res.status(404).end();
  }
});

app.get("/api/jobs/:id/download/:index", async (req, res) => {
  const job = jobs.get(req.params.id);
  const outputIndex = Number(req.params.index);
  const output = job?.outputs.find((item) => item.index === outputIndex);
  if (!job || !Number.isInteger(outputIndex) || !output || output.status !== "done" || !output.outputLocation) {
    res.status(404).json({ error: "Video chưa sẵn sàng hoặc tác vụ đã hết hạn." });
    return;
  }
  try {
    await stat(output.outputLocation);
    res.download(
      output.outputLocation,
      `skilledit-video-${String(output.index).padStart(2, "0")}.mp4`,
    );
  } catch {
    res.status(404).json({ error: "Tệp video đã hết hạn." });
  }
});

setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if ((job.status === "done" || job.status === "failed") && now - job.updatedAt > jobRetentionMs) {
      jobs.delete(id);
      void rm(job.directory, { recursive: true, force: true }).catch((error) => {
        console.error(`[job ${id}] cleanup failed`, error);
      });
    }
  }
}, 5 * 60 * 1000).unref();

async function start() {
  if (process.env.NODE_ENV === "production" && appPassword.length < 12) {
    throw new Error("Set a unique APP_PASSWORD of at least 12 characters in the Render environment.");
  }

  runtimeDir = await mkdtemp(path.join(os.tmpdir(), "skilledit-web-"));
  const rendererPublicDir = path.join(runtimeDir, "renderer-public");
  const bundleDir = path.join(runtimeDir, "bundle");
  await mkdir(rendererPublicDir, { recursive: true });
  console.info("[startup] Building the Remotion web renderer.");
  bundleUrl = await bundle({
    entryPoint,
    outDir: bundleDir,
    publicDir: rendererPublicDir,
  });
  console.info("[startup] Remotion renderer is ready.");

  const server = createServer(app);
  server.listen(port, "0.0.0.0", () => {
    console.info(`[startup] Skilledit MVP listening on port ${port}.`);
  });

  const shutdown = () => {
    server.close(() => {
      if (runtimeDir) void rm(runtimeDir, { recursive: true, force: true });
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

start().catch((error) => {
  console.error("[startup] Unable to start Skilledit MVP", error);
  process.exitCode = 1;
});
