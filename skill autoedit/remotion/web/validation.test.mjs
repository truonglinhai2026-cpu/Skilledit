import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllowedFileType,
  MAX_FILES,
  getGroupSizes,
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
  assert.deepEqual(validateJobOptions({ duration: "4", aspectRatio: "portrait", videoCount: "1" }, 2), {
    duration: 4,
    videoCount: 1,
    groupSizes: [2],
    width: 480,
    height: 854,
  });
  assert.deepEqual(validateJobOptions({ duration: "4", aspectRatio: "landscape", videoCount: "1" }, 2), {
    duration: 4,
    videoCount: 1,
    groupSizes: [2],
    width: 854,
    height: 480,
  });
});

test("splits source files in order into balanced output groups", () => {
  assert.deepEqual(getGroupSizes(5, 5), [1, 1, 1, 1, 1]);
  assert.deepEqual(getGroupSizes(12, 5), [3, 3, 2, 2, 2]);
  assert.deepEqual(getGroupSizes(25, 5), [5, 5, 5, 5, 5]);
});

test("validates single and five-video jobs against each output's 60 second limit", () => {
  assert.deepEqual(
    validateJobOptions({ duration: "12", aspectRatio: "portrait", videoCount: "5" }, 25).groupSizes,
    [5, 5, 5, 5, 5],
  );
  assert.equal(
    validateJobOptions({ duration: "12", aspectRatio: "landscape", videoCount: "5" }, 25).duration,
    12,
  );
  assert.equal(
    validateJobOptions({ duration: "60", aspectRatio: "portrait", videoCount: "1" }, 1).duration,
    60,
  );
  assert.equal(
    validateJobOptions({ duration: "60", aspectRatio: "portrait", videoCount: "5" }, 5).duration,
    60,
  );
  assert.equal(
    validateJobOptions({ duration: "2", aspectRatio: "portrait", videoCount: "1" }, 25).duration,
    2,
  );
  assert.throws(() => validateJobOptions({ duration: "12", aspectRatio: "portrait", videoCount: "1" }, 6));
  assert.throws(() => validateJobOptions({ duration: "4", aspectRatio: "portrait", videoCount: "5" }, 4));
});

test("rejects invalid counts, durations, and formats", () => {
  assert.throws(() => validateJobOptions({ duration: "4", aspectRatio: "portrait", videoCount: "1" }, 0));
  assert.throws(() => validateJobOptions({ duration: "4", aspectRatio: "portrait", videoCount: "1" }, MAX_FILES + 1));
  assert.throws(() => validateJobOptions({ duration: "0", aspectRatio: "portrait", videoCount: "1" }, 1));
  assert.throws(() => validateJobOptions({ duration: "61", aspectRatio: "portrait", videoCount: "1" }, 1));
  assert.throws(() => validateJobOptions({ duration: "60", aspectRatio: "portrait", videoCount: "1" }, 2));
  assert.throws(() => validateJobOptions({ duration: "4", aspectRatio: "square", videoCount: "1" }, 1));
  assert.throws(() => validateJobOptions({ duration: "4", aspectRatio: "portrait", videoCount: "2" }, 2));
});
