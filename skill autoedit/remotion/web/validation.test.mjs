import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllowedFileType,
  MAX_FILES,
  validateJobOptions,
} from "./validation.mjs";

test("accepts matching supported image and video formats", () => {
  assert.equal(getAllowedFileType("photo.JPG", "image/jpeg"), "image");
  assert.equal(getAllowedFileType("clip.mp4", "video/mp4"), "video");
  assert.equal(getAllowedFileType("clip.mov", "video/quicktime"), "video");
  assert.equal(getAllowedFileType("clip.webm", "video/webm"), "video");
});

test("rejects unsupported or mismatched upload types", () => {
  assert.equal(getAllowedFileType("payload.exe", "application/octet-stream"), null);
  assert.equal(getAllowedFileType("photo.jpg", "image/png"), null);
  assert.equal(getAllowedFileType("clip.mp4", "text/plain"), null);
});

test("sets the requested output orientation", () => {
  assert.deepEqual(validateJobOptions({ duration: "4", aspectRatio: "portrait" }, 2), {
    duration: 4,
    width: 480,
    height: 854,
  });
  assert.deepEqual(validateJobOptions({ duration: "4", aspectRatio: "landscape" }, 2), {
    duration: 4,
    width: 854,
    height: 480,
  });
});

test("rejects empty, excessive, and overlong jobs", () => {
  assert.throws(() => validateJobOptions({ duration: "4", aspectRatio: "portrait" }, 0));
  assert.throws(() => validateJobOptions({ duration: "4", aspectRatio: "portrait" }, MAX_FILES + 1));
  assert.throws(() => validateJobOptions({ duration: "8", aspectRatio: "portrait" }, 4));
  assert.throws(() => validateJobOptions({ duration: "9", aspectRatio: "portrait" }, 1));
  assert.throws(() => validateJobOptions({ duration: "4", aspectRatio: "square" }, 1));
});
