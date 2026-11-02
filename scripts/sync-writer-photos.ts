// Auto-populate WRITER_PHOTOS for any curated writer that lacks a portrait,
// and self-host every portrait under /public/writers/ to bypass Wikimedia's
// per-User-Agent thumbnail policy (Vercel's image optimizer + plain browser
// UAs both get HTTP 400 on most thumb sizes; only sizes already pre-cached
// by the foundation reliably serve to non-allow-listed UAs).
//
//   npx tsx scripts/sync-writer-photos.ts
//
// Strategy:
//   1. Diff CURATED_WRITERS vs WRITER_PHOTOS.
//   2. For missing/stale writers, hit Wikipedia REST summary, prefer
//      originalimage.source over thumbnail.source (thumb.wikimedia.org
//      rejects on-demand sizes it hasn't pre-cached for this UA with
//      HTTP 400, so we can't just rewrite the /NNpx-/ segment — we fetch
//      the full original and downsize locally instead).
//   3. Download every portrait to /public/writers/{slug}.{ext} with a real
//      UA, then resize locally (sharp) to TARGET_WIDTH if wider — never
//      upscale past the source.
//   4. Write WRITER_PHOTOS entries pointing at the local path, and a
//      manifest.json of {slug: {file, source, subject, width, height}}.
//
// Wired as `prebuild` — Vercel re-downloads any missing files on each deploy
// (no-op if /public/writers/ is committed; one-time fetch if gitignored).

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const ROOT = join(__dirname, "..");
const WRITER_DATA_PATH = join(ROOT, "src", "lib", "writer-data.ts");
const PHOTOS_PATH = join(ROOT, "src", "lib", "writer-photos.ts");
const PUBLIC_WRITERS_DIR = join(ROOT, "public", "writers");
const MANIFEST_PATH = join(PUBLIC_WRITERS_DIR, "manifest.json");

const UA = "DoppelWriter/1.0 (https://doppelwriter.com; nicholauscmills@gmail.com)";

// Our largest rendered slot (WriterCarouselGallery / HomepageCinematic) is
// ~330-366px CSS width; resize to 800px wide so retina (2x+) displays get a
// sharp image. We never upscale past the source's own width.
const TARGET_WIDTH = 800;

// Below this, an on-disk photo is treated as stale (pre-dates the
// TARGET_WIDTH bump) and is re-fetched even though a file already exists.
const MIN_ACCEPTABLE_WIDTH = 600;

// Wikipedia article titles for writers whose display name disambiguates wrong.
const NAME_OVERRIDES: Record<string, string> = {
  "Ben Thompson": "Ben_Thompson_(business_writer)",
  "Howard Marks": "Howard_Marks_(investor)",
  "Ryan Holiday": "Ryan_Holiday",
  "H.L. Mencken": "H._L._Mencken",
  "C.S. Lewis": "C._S._Lewis",
  "J.K. Rowling": "J._K._Rowling",
  "R.L. Stine": "R._L._Stine",
  "Dr. Seuss": "Dr._Seuss",
  "Conan O'Brien": "Conan_O%27Brien",
};

// Hand-curated source URLs for writers Wikipedia can't auto-resolve.
const MANUAL_SOURCES: Record<string, string> = {
  "Matt Levine":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Matt_levine.jpg/250px-Matt_levine.jpg",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCuratedNames(): string[] {
  const src = readFileSync(WRITER_DATA_PATH, "utf-8");
  const names: string[] = [];
  const re = /\{\s*name:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) names.push(m[1]);
  return names;
}

function parseExistingPhotos(): Record<string, string> {
  if (!existsSync(PHOTOS_PATH)) return {};
  const src = readFileSync(PHOTOS_PATH, "utf-8");
  const photos: Record<string, string> = {};
  const re = /"([^"]+)":\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) photos[m[1]] = m[2];
  return photos;
}

async function fetchPortraitUrl(name: string): Promise<string | null> {
  if (MANUAL_SOURCES[name]) return MANUAL_SOURCES[name];
  const title = NAME_OVERRIDES[name] ?? encodeURIComponent(name.replace(/\s+/g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.warn(`[sync-photos] ${name}: summary HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as {
      type?: string;
      thumbnail?: { source?: string; width?: number };
      originalimage?: { source?: string; width?: number };
    };
    if (data.type === "disambiguation") {
      console.warn(`[sync-photos] ${name}: disambiguation`);
      return null;
    }
    // Prefer the full original (hosted at upload.wikimedia.org, no dynamic
    // thumbnailing) so we control the downsize ourselves; fall back to
    // whatever thumbnail size the summary already gives us.
    return data.originalimage?.source ?? data.thumbnail?.source ?? null;
  } catch (err) {
    console.warn(`[sync-photos] ${name}: summary error — ${err}`);
    return null;
  }
}

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpe?g|png|webp|gif)(?:\?|$)/i);
  return (m?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
}

async function downloadTo(url: string, fullPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.warn(`[sync-photos] download HTTP ${res.status}: ${url}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) {
      console.warn(`[sync-photos] download tiny (${buf.length}B): ${url}`);
      return false;
    }
    writeFileSync(fullPath, buf);
    return true;
  } catch (err) {
    console.warn(`[sync-photos] download error — ${err}`);
    return false;
  }
}

// Downsize an on-disk image to targetWidth if it's wider. Never upscales.
// Re-encodes in the same format sharp detected (no explicit .jpeg()/.png()
// call, so output format tracks input format).
async function downsizeTo(fullPath: string, targetWidth: number): Promise<void> {
  try {
    const meta = await sharp(fullPath).metadata();
    if (!meta.width || meta.width <= targetWidth) return;
    const buf = await sharp(fullPath).resize({ width: targetWidth }).toBuffer();
    writeFileSync(fullPath, buf);
  } catch (err) {
    console.warn(`[sync-photos] downsize error on ${fullPath} — ${err}`);
  }
}

function writePhotos(photos: Record<string, string>) {
  const sorted = Object.keys(photos).sort((a, b) => a.localeCompare(b));
  const body = sorted
    .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(photos[k])},`)
    .join("\n");
  const file = `// Local paths under /public/writers/. Generated by scripts/sync-writer-photos.ts.\nexport const WRITER_PHOTOS: Record<string, string> = {\n${body}\n};\n`;
  writeFileSync(PHOTOS_PATH, file, "utf-8");
}

async function widthOf(fullPath: string): Promise<number | null> {
  try {
    const meta = await sharp(fullPath).metadata();
    return meta.width ?? null;
  } catch {
    return null;
  }
}

type EnsureResult = { localPath: string; source: string; width: number | null; height: number | null };

async function ensureLocal(
  name: string,
  existing: Record<string, string>,
): Promise<EnsureResult | null> {
  const slug = slugify(name);
  const existingValue = existing[name];

  // Already a local path that exists on disk → keep, UNLESS it's a
  // pre-TARGET_WIDTH-bump low-res file, in which case fall through and
  // re-fetch at the larger size.
  if (existingValue?.startsWith("/writers/")) {
    const filename = existingValue.slice("/writers/".length);
    const fullPath = join(PUBLIC_WRITERS_DIR, filename);
    if (existsSync(fullPath) && statSync(fullPath).size > 500) {
      const width = await widthOf(fullPath);
      if (width !== null && width >= MIN_ACCEPTABLE_WIDTH) {
        const meta = await sharp(fullPath).metadata();
        return { localPath: existingValue, source: "cached", width, height: meta.height ?? null };
      }
    }
  }

  // Otherwise, find a source URL: existing remote, manual, or Wikipedia lookup.
  let sourceUrl =
    existingValue && existingValue.startsWith("http")
      ? existingValue
      : MANUAL_SOURCES[name] ?? (await fetchPortraitUrl(name));
  if (!sourceUrl) return null;

  const ext = extFromUrl(sourceUrl);
  const filename = `${slug}.${ext}`;
  const fullPath = join(PUBLIC_WRITERS_DIR, filename);
  const localPath = `/writers/${filename}`;

  // Skip re-download only if the file on disk is already large enough.
  if (existsSync(fullPath) && statSync(fullPath).size > 500) {
    const width = await widthOf(fullPath);
    if (width !== null && width >= MIN_ACCEPTABLE_WIDTH) {
      const meta = await sharp(fullPath).metadata();
      return { localPath, source: sourceUrl, width, height: meta.height ?? null };
    }
  }

  const ok = await downloadTo(sourceUrl, fullPath);
  if (!ok) return null;
  await downsizeTo(fullPath, TARGET_WIDTH);
  const meta = await sharp(fullPath).metadata();
  return { localPath, source: sourceUrl, width: meta.width ?? null, height: meta.height ?? null };
}

async function main() {
  if (!existsSync(PUBLIC_WRITERS_DIR)) mkdirSync(PUBLIC_WRITERS_DIR, { recursive: true });

  const curated = parseCuratedNames();
  const existing = parseExistingPhotos();

  // Fix legacy key drift before we start.
  if (existing["Ben Thompson (analyst)"] && !existing["Ben Thompson"]) {
    existing["Ben Thompson"] = existing["Ben Thompson (analyst)"];
  }

  const photos: Record<string, string> = {};
  const manifest: Record<
    string,
    { file: string; source: string; subject: string; width: number | null; height: number | null }
  > = {};
  let resolved = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const name of curated) {
    const result = await ensureLocal(name, existing);
    if (result) {
      photos[name] = result.localPath;
      const slug = slugify(name);
      manifest[slug] = {
        file: result.localPath,
        source: result.source,
        subject: name,
        width: result.width,
        height: result.height,
      };
      resolved++;
    } else {
      failed++;
      failures.push(name);
    }
    // Gentle rate limit against Wikipedia (<=2 req/s between full lookups).
    await new Promise((r) => setTimeout(r, 500));
  }

  writePhotos(photos);
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
  console.log(
    `[sync-photos] done. curated=${curated.length} resolved=${resolved} failed=${failed}`,
  );
  if (failures.length) {
    console.log(`[sync-photos] no portrait: ${failures.join(", ")}`);
  }
}

main().catch((err) => {
  console.error("[sync-photos] fatal:", err);
  process.exit(1);
});
