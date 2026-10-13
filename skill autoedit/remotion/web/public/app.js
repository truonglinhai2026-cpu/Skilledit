const passwordKey = "skilledit-app-password";
const loginPanel = document.querySelector("#login-panel");
const studioPanel = document.querySelector("#studio-panel");
const loginForm = document.querySelector("#login-form");
const renderForm = document.querySelector("#render-form");
const fileInput = document.querySelector("#files");
const fileList = document.querySelector("#file-list");
const fileListWrap = document.querySelector("#file-list-wrap");
const renderButton = document.querySelector("#render-button");
const jobPanel = document.querySelector("#job-panel");
const outputList = document.querySelector("#output-list");
const maxFiles = 25;
const maxFileBytes = 25 * 1024 * 1024;
const maxJobSeconds = 60;
const maxClipSeconds = 60;
let selectedFiles = [];
let activeJobId = null;

const formatBytes = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const getPassword = () => sessionStorage.getItem(passwordKey) || "";

async function request(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const password = getPassword();
  if (password) headers.set("Authorization", `Bearer ${password}`);

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && url !== "/api/session") {
    sessionStorage.removeItem(passwordKey);
    showLogin();
  }
  return response;
}

function showLogin() {
  loginPanel.hidden = false;
  studioPanel.hidden = true;
  document.querySelector("#password").focus();
}

function showStudio() {
  loginPanel.hidden = true;
  studioPanel.hidden = false;
}

function showFiles() {
  fileList.replaceChildren();
  fileListWrap.hidden = selectedFiles.length === 0;
  const videoCount = Number(renderForm.elements.videoCount.value);
  const groupSizes = selectedFiles.length >= videoCount
    ? getBalancedGroupSizes(selectedFiles.length, videoCount)
    : [];
  let groupIndex = -1;
  let groupEnd = 0;
  selectedFiles.forEach((file, index) => {
    const row = document.createElement("li");
    row.className = "file-row";
    if (groupSizes.length > 0) {
      while (index >= groupEnd) {
        groupEnd += groupSizes[groupIndex + 1];
        groupIndex += 1;
      }
    }

    const number = document.createElement("span");
    number.className = "file-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const details = document.createElement("span");
    details.className = "file-details";
    const name = document.createElement("strong");
    name.textContent = file.name;
    const info = document.createElement("span");
    info.className = "muted";
    const groupLabel = groupIndex >= 0
      ? ` · Video ${String(groupIndex + 1).padStart(2, "0")}`
      : "";
    info.textContent = `${file.type.startsWith("video/") ? "Video" : "Ảnh"} · ${formatBytes(file.size)}${groupLabel}`;
    details.append(name, info);

    const controls = document.createElement("span");
    controls.className = "file-controls";
    const upButton = makeControlButton("Đưa lên", "↑", index === 0, () => moveFile(index, -1));
    const downButton = makeControlButton("Đưa xuống", "↓", index === selectedFiles.length - 1, () => moveFile(index, 1));
    const removeButton = makeControlButton("Xóa tệp", "×", false, () => {
      selectedFiles.splice(index, 1);
      showFiles();
    });
    controls.append(upButton, downButton, removeButton);
    row.append(number, details, controls);
    fileList.append(row);
  });
  updateFormSummary();
}

function makeControlButton(label, text, disabled, onClick) {
  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.textContent = text;
  button.disabled = disabled;
  button.addEventListener("click", onClick);
  return button;
}

function moveFile(index, offset) {
  const nextIndex = index + offset;
  if (nextIndex < 0 || nextIndex >= selectedFiles.length) return;
  [selectedFiles[index], selectedFiles[nextIndex]] = [selectedFiles[nextIndex], selectedFiles[index]];
  showFiles();
}

function getBalancedGroupSizes(fileCount, groupCount) {
  const baseSize = Math.floor(fileCount / groupCount);
  const largerGroupCount = fileCount % groupCount;
  return Array.from(
    { length: groupCount },
    (_, index) => baseSize + (index < largerGroupCount ? 1 : 0),
  );
}

function setJobState(job) {
  const title = document.querySelector("#job-title");
  const badge = document.querySelector("#job-badge");
  const message = document.querySelector("#job-message");
  const error = document.querySelector("#job-error");
  const progressBar = document.querySelector("#progress-bar");
  const labels = {
    queued: ["Đang chờ", "Tác vụ đang trong hàng đợi."],
    rendering: ["Đang dựng", "Remotion đang ghép và xuất video."],
    done: ["Hoàn tất", "Video đã sẵn sàng để tải xuống."],
    failed: ["Không thành công", "Tác vụ không thể hoàn tất."],
  };
  const [badgeText, messageText] = labels[job.status] || ["Đang xử lý", "Đang kiểm tra trạng thái."];

  title.textContent = job.status === "done"
    ? "Video đã sẵn sàng"
    : job.status === "failed" && job.outputs?.some((output) => output.status === "done")
      ? "Một số video đã hoàn tất"
      : "Đang tạo video";
  badge.textContent = badgeText;
  message.textContent = messageText;
  error.textContent = job.error || "";
  progressBar.style.width = `${Math.round((job.progress || 0) * 100)}%`;
  outputList.replaceChildren();
  for (const output of job.outputs || []) {
    const row = document.createElement("div");
    row.className = "output-row";
    const label = document.createElement("span");
    label.textContent = `Video ${String(output.index).padStart(2, "0")}`;
    row.append(label);
    if (output.status === "done") {
      const button = document.createElement("button");
      button.className = "button button-primary";
      button.type = "button";
      button.textContent = `Tải video ${String(output.index).padStart(2, "0")}`;
      button.addEventListener("click", () => downloadOutput(output.index));
      row.append(button);
    } else {
      const state = document.createElement("span");
      state.className = "muted";
      state.textContent = output.status === "failed"
        ? "Render lỗi"
        : output.status === "rendering"
          ? "Đang render"
          : "Đang chờ";
      row.append(state);
    }
    outputList.append(row);
  }

  if (job.status === "done" || job.status === "failed") {
    renderButton.disabled = false;
    renderButton.querySelector("span:first-child").textContent = "Dựng video khác";
  }
}

async function watchJob(jobId) {
  while (activeJobId === jobId) {
    try {
      const response = await request(`/api/jobs/${jobId}`);
      const job = await response.json();
      if (!response.ok) throw new Error(job.error || "Không đọc được trạng thái video.");
      setJobState(job);
      if (job.status === "done" || job.status === "failed") return;
    } catch (error) {
      document.querySelector("#job-error").textContent = error.message;
      renderButton.disabled = false;
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

fileInput.addEventListener("change", () => {
  addFiles(Array.from(fileInput.files || []));
  fileInput.value = "";
});

function addFiles(incoming) {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"]);
  const rejected = incoming.find((file) => !allowedTypes.has(file.type) || file.size > maxFileBytes);
  if (rejected) {
    window.alert(`${rejected.name}: chỉ nhận ảnh/video được hỗ trợ, tối đa 25 MB mỗi tệp.`);
    return;
  }
  if (selectedFiles.length + incoming.length > maxFiles) {
    window.alert(`Chỉ chọn tối đa ${maxFiles} tệp cho một lần render.`);
    return;
  }
  selectedFiles = selectedFiles.concat(incoming);
  showFiles();
}

const dropzone = document.querySelector("#dropzone");
dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dragging");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragging");
  addFiles(Array.from(event.dataTransfer?.files || []));
});

function updateFormSummary() {
  const videoCount = Number(renderForm.elements.videoCount.value);
  const durationSelect = renderForm.elements.duration;
  const largestGroupSize = selectedFiles.length >= videoCount
    ? Math.ceil(selectedFiles.length / videoCount)
    : 1;
  const maxDuration = Math.min(maxClipSeconds, Math.floor(maxJobSeconds / largestGroupSize));
  const availableDurations = Array.from(durationSelect.options)
    .filter((option) => Number(option.value) <= maxDuration);
  const allowedDuration = Number(availableDurations.at(-1).value);
  for (const option of durationSelect.options) {
    option.disabled = Number(option.value) > maxDuration;
  }
  if (Number(durationSelect.value) > maxDuration) {
    durationSelect.value = String(allowedDuration);
  }
  document.querySelector("#video-count-note").textContent = videoCount === 5
    ? `Chọn từ 5 đến ${maxFiles} tệp. Tệp được chia tuần tự, cân bằng thành 5 nhóm để tạo 5 video riêng.`
    : `Chọn từ 1 đến ${maxFiles} tệp để tạo một video.`;
  document.querySelector("#duration-note").textContent =
    `Mỗi tư liệu tối đa ${allowedDuration} giây với số tệp hiện tại; mỗi video không quá ${maxJobSeconds} giây. Video gốc giữ âm thanh.`;
  renderButton.querySelector("span:first-child").textContent = `Dựng ${videoCount} video`;
}

renderForm.elements.videoCount.addEventListener("change", () => {
  showFiles();
});
renderForm.elements.duration.addEventListener("change", updateFormSummary);
document.querySelector("#clear-files").addEventListener("click", () => {
  selectedFiles = [];
  showFiles();
});
updateFormSummary();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = document.querySelector("#login-error");
  error.textContent = "";
  const password = new FormData(loginForm).get("password");
  try {
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Không thể đăng nhập.");
    sessionStorage.setItem(passwordKey, password);
    showStudio();
  } catch (loginError) {
    error.textContent = loginError.message;
  }
});

renderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const jobError = document.querySelector("#job-error");
  jobError.textContent = "";
  if (selectedFiles.length === 0) {
    jobError.textContent = "Hãy chọn ít nhất một ảnh hoặc video.";
    jobPanel.hidden = false;
    return;
  }

  const values = new FormData(renderForm);
  const videoCount = Number(values.get("videoCount"));
  const duration = Number(values.get("duration"));
  if (selectedFiles.length < videoCount) {
    jobError.textContent = `Cần ít nhất ${videoCount} tệp để chia thành ${videoCount} video.`;
    jobPanel.hidden = false;
    return;
  }
  const largestGroupSize = Math.ceil(selectedFiles.length / videoCount);
  if (duration * largestGroupSize > maxJobSeconds) {
    jobError.textContent = `Mỗi video sẽ vượt quá ${maxJobSeconds} giây. Hãy giảm thời lượng mỗi tư liệu hoặc bỏ bớt tệp.`;
    jobPanel.hidden = false;
    return;
  }

  const body = new FormData();
  selectedFiles.forEach((file) => body.append("files", file, file.name));
  body.append("duration", String(values.get("duration")));
  body.append("aspectRatio", String(values.get("aspectRatio")));
  body.append("videoCount", String(videoCount));

  renderButton.disabled = true;
  renderButton.querySelector("span:first-child").textContent = "Đang tải lên…";
  jobPanel.hidden = false;
  outputList.replaceChildren();
  try {
    const response = await request("/api/jobs", { method: "POST", body });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Không thể bắt đầu render.");
    activeJobId = result.id;
    setJobState(result);
    await watchJob(result.id);
  } catch (error) {
    jobError.textContent = error.message;
    renderButton.disabled = false;
    renderButton.querySelector("span:first-child").textContent = "Thử lại";
  }
});

async function downloadOutput(index) {
  if (!activeJobId) return;
  const button = Array.from(outputList.querySelectorAll("button"))
    .find((candidate) => candidate.textContent.endsWith(String(index).padStart(2, "0")));
  if (button) button.disabled = true;
  try {
    const response = await request(`/api/jobs/${activeJobId}/download/${index}`);
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Không tải được video.");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skilledit-video-${String(index).padStart(2, "0")}.mp4`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    document.querySelector("#job-error").textContent = error.message;
  } finally {
    if (button) button.disabled = false;
  }
}

async function initialize() {
  if (!getPassword()) {
    showLogin();
    return;
  }
  const response = await request("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: getPassword() }),
  });
  if (response.ok) showStudio();
  else showLogin();
}

initialize().catch((error) => {
  showLogin();
  document.querySelector("#login-error").textContent = error.message;
});
