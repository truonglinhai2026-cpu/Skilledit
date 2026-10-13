export const MAX_FILES = 25;
export const MAX_OUTPUTS = 5;
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_JOB_SECONDS = 60;
export const MAX_CLIP_SECONDS = 60;

const allowedFiles = new Map([
  [".jpg", new Set(["image/jpeg"])],
  [".jpeg", new Set(["image/jpeg"])],
  [".png", new Set(["image/png"])],
  [".webp", new Set(["image/webp"])],
  [".mp4", new Set(["video/mp4"])],
  [".mov", new Set(["video/quicktime"])],
  [".webm", new Set(["video/webm"])],
]);

export function getAllowedFileType(filename, mimeType) {
  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  const mimeTypes = allowedFiles.get(extension);
  if (!mimeTypes?.has(mimeType)) return null;

  return extension.startsWith(".") && [".jpg", ".jpeg", ".png", ".webp"].includes(extension)
    ? "image"
    : "video";
}

export function getGroupSizes(fileCount, groupCount) {
  if (!Number.isInteger(fileCount) || !Number.isInteger(groupCount) || groupCount < 1) {
    throw new Error("Số lượng tệp hoặc video không hợp lệ.");
  }
  if (fileCount < groupCount) {
    throw new Error(`Cần ít nhất ${groupCount} tệp để tạo ${groupCount} video.`);
  }

  const baseSize = Math.floor(fileCount / groupCount);
  const largerGroupCount = fileCount % groupCount;
  return Array.from(
    { length: groupCount },
    (_, index) => baseSize + (index < largerGroupCount ? 1 : 0),
  );
}

export function validateJobOptions(body, fileCount) {
  if (!Number.isInteger(fileCount) || fileCount < 1 || fileCount > MAX_FILES) {
    throw new Error(`Hãy chọn từ 1 đến ${MAX_FILES} tệp.`);
  }

  const videoCount = Number(body.videoCount);
  if (videoCount !== 1 && videoCount !== MAX_OUTPUTS) {
    throw new Error(`Chỉ có thể tạo 1 hoặc ${MAX_OUTPUTS} video mỗi lần.`);
  }
  const groupSizes = getGroupSizes(fileCount, videoCount);

  const duration = Number(body.duration);
  if (!Number.isFinite(duration) || duration < 1 || duration > MAX_CLIP_SECONDS) {
    throw new Error(`Thời lượng mỗi mục phải từ 1 đến ${MAX_CLIP_SECONDS} giây.`);
  }
  if (groupSizes.some((groupSize) => duration * groupSize > MAX_JOB_SECONDS)) {
    throw new Error(`Mỗi video không được dài quá ${MAX_JOB_SECONDS} giây.`);
  }

  const aspectRatio = body.aspectRatio;
  if (aspectRatio !== "portrait" && aspectRatio !== "landscape") {
    throw new Error("Hãy chọn khung hình dọc hoặc ngang.");
  }

  return {
    duration,
    videoCount,
    groupSizes,
    width: aspectRatio === "portrait" ? 480 : 854,
    height: aspectRatio === "portrait" ? 854 : 480,
  };
}
