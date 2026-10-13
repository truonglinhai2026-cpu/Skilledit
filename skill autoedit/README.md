# Auto-edit video workspace

This folder contains the video-editing skill, its scripts, and a Remotion renderer. It supports two workflows:

1. Edit one source video and add image/video B-roll using the editing skill.
2. Build a slideshow from any ordered list of images and video clips.

## Slideshow from your own media

1. Copy your images and video clips into `remotion/public/media/` (create the `media` folder if it does not exist).
2. Open `remotion/src/slideshow.json` and replace the example items. `src` is relative to `remotion/public/`:

   ```json
   {
     "src": "media/my-photo.jpg",
     "type": "image",
     "durationInSeconds": 4,
     "fit": "cover"
   }
   ```

   For a video clip, use `"type": "video"` and set its display duration. Video audio is kept by default; set `"muted": true` to mute that clip. Add as many items as needed, in the order they should appear. Images default to `contain`; use `cover` to fill the screen and crop edges. Slideshow scenes use direct cuts.

3. From the `remotion` folder, run:

   ```powershell
   npm.cmd run render:slideshow
   ```

   The result is `remotion/out/slideshow.mp4`. Change `width`, `height`, and `fps` in `slideshow.json` to choose a different output format.

The checked-in slideshow config uses two sample images so it can be rendered immediately. Replace those entries with paths to your own media when ready. Media files are not copied into source code: keep them under `remotion/public/media/` and refer to them by their path below `public`.

## Edit a source video with B-roll

For the existing edit workflow, provide the source video to the editing skill. It can use user-supplied photos/videos as B-roll in addition to the source footage. In a B-roll plan, reference files stored in the job's `broll/` folder, for example:

```json
{
  "kind": "image_card",
  "start_sec": 8.2,
  "end_sec": 11.5,
  "reason": "A real photo illustrates the place being discussed.",
  "image_path": "broll/my-photo.jpg"
}
```

The skill stages referenced media for Remotion and renders the edit. See [SKILL.md](./SKILL.md) for the editing workflow and requirements.

## Renderer setup

The standalone slideshow renderer uses the dependencies in `remotion/`. If they are not installed yet, run `npm install` from that folder. The source-video editing scripts have additional Python, FFmpeg, and Bash requirements described by `scripts/doctor.py` and [SKILL.md](./SKILL.md).

## Web MVP on Render

The experimental web studio accepts up to 25 JPG/PNG/WebP images or MP4/MOV/WebM clips (25 MB each). Choose one output video, or split the ordered source files as evenly as possible into five consecutive groups and render one video per group. Five-video mode requires at least five source files. Each item uses the same duration; the app limits it so every output stays within 60 seconds. A single source item can be set to 60 seconds. Outputs render sequentially at 24 fps in portrait or landscape format and are available to download for up to one hour.

This is a slideshow MVP, not an automatic professional editing service: it does not analyze footage, select highlights, or add captions. Render's free service has limited compute and ephemeral storage. Rendering five videos or longer videos takes more time and memory; a free instance may restart before finishing. Uploaded media and output files can be lost on restart or redeploy, so this version is for small tests only. Do not upload private or irreplaceable media.

### Run locally

From PowerShell:

```powershell
cd "skill autoedit\remotion"
$env:APP_PASSWORD = "choose-a-local-password"
npm.cmd run start:web
```

Open `http://localhost:3000`. The app bundles its small Remotion composition at startup and needs the browser installed by Remotion. To run its focused validation tests:

```powershell
npm.cmd run test:web
```

### Deploy a test instance on Render

1. Push the project to GitHub. The repository root contains the `skill autoedit` folder; do not upload `__MACOSX`, `.env`, `.venv`, `node_modules`, or generated renders.
2. In Render, create a **Web Service** from the GitHub repository and select the **Free** instance for testing.
3. Set **Root Directory** to `skill autoedit`, **Runtime** to Docker, and **Dockerfile Path** to `remotion/Dockerfile`.
4. Set the environment variable `APP_PASSWORD` to a unique password of at least 12 characters. Keep it private.
5. Deploy. Subsequent pushes to the connected branch can trigger automatic deploys.

The app stores jobs only in the running instance's temporary filesystem and in memory. Restarting or redeploying clears jobs; an idle free service may take time to wake. A free instance may not have enough memory for every media file, so keep inputs short and small. Use paid compute and persistent/object storage before offering this to other users.
