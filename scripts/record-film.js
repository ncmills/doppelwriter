// Records /preview/film via Playwright, hiding page chrome via injected CSS,
// and saves the webm + mp4 to _assets/scenes/exports/.
//
// Run: node scripts/record-film.js
// Assumes a dev server (or any URL) reachable at the URL passed as arg or
// FILM_URL env. Defaults to http://localhost:3000/preview/film.

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const URL = process.env.FILM_URL || process.argv[2] || "http://localhost:3000/preview/film";
const OUT_DIR = path.resolve(__dirname, "..", "_assets", "scenes", "exports");
const DURATION_MS = 31000; // 30s film + 1s tail
const SIZE = { width: 1920, height: 1080 };

// CSS hides everything except the film stage.
const CHROME_HIDE_CSS = `
  body { background: var(--color-paper, #faf7f0) !important; }
  header, nav, footer, .border-t,
  section.max-w-6xl > p, section.max-w-6xl > ol, section.max-w-6xl > ul,
  section.max-w-6xl > div > p, h1, button { display: none !important; }
  /* Center and size the film stage */
  body, main, header, section { padding: 0 !important; margin: 0 !important; }
  .film-stage { width: 100vw !important; height: 100vh !important; aspect-ratio: auto !important; border: 0 !important; }
  .film-scrubber { display: none !important; }
`;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Launching Chromium → ${URL}`);
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: SIZE },
  });

  // Inject chrome-hiding CSS as soon as DOM is ready, before paint.
  await context.addInitScript(() => {
    const style = document.createElement("style");
    style.id = "huashu-record-chrome-hide";
    document.documentElement.appendChild(style);
    const apply = () => {
      style.textContent = `
        body { background: #faf7f0 !important; overflow: hidden !important; }
        header, nav, footer { display: none !important; }
        h1, button, ol, ul { display: none !important; }
        section.max-w-6xl > div > p { display: none !important; }
        body, main, header, section { padding: 0 !important; margin: 0 !important; }
        .film-stage { width: 100vw !important; height: 100vh !important; aspect-ratio: auto !important; border: 0 !important; }
        .film-scrubber { display: none !important; }
      `;
    };
    if (document.readyState !== "loading") apply();
    else document.addEventListener("DOMContentLoaded", apply);
  });

  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });

  // Wait for the film stage to mount, then for fonts.
  await page.waitForSelector(".film-stage", { timeout: 10000 });
  await page.evaluate(async () => {
    if ("fonts" in document) await document.fonts.ready;
  });
  // Reload to start the rAF timeline cleanly with everything already cached.
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".film-stage");
  await page.evaluate(async () => {
    if ("fonts" in document) await document.fonts.ready;
  });

  // Give the rAF a frame to actually start before timing.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
  console.log(`Recording for ${DURATION_MS}ms…`);
  await page.waitForTimeout(DURATION_MS);

  await page.close();
  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();

  if (!videoPath) {
    console.error("No video path returned by Playwright");
    process.exit(1);
  }

  const webmDest = path.join(OUT_DIR, "marketing-film.webm");
  fs.renameSync(videoPath, webmDest);
  console.log(`webm saved → ${webmDest}`);

  // Convert to MP4 (60fps interpolated) using ffmpeg
  const mp4Dest = path.join(OUT_DIR, "marketing-film-silent.mp4");
  console.log(`Converting webm → mp4 (60fps)…`);
  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i", webmDest,
      "-vf", "minterpolate=fps=60:mi_mode=mci:me_mode=bidir:vsbmc=1",
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "20",
      "-pix_fmt", "yuv420p",
      mp4Dest,
    ],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
  if (ff.status !== 0) {
    console.error("ffmpeg conversion failed");
    process.exit(1);
  }
  console.log(`mp4 saved → ${mp4Dest}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
