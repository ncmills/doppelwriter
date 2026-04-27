// Auto-populate WRITER_PHOTOS for any curated writer that lacks a portrait.
//   npx tsx scripts/sync-writer-photos.ts
//
// Strategy: query Wikipedia's REST summary API for each missing name, extract
// thumbnail.source, write back to src/lib/writer-photos.ts (sorted, alpha).
//
// Wired as `prebuild` so every Vercel deploy auto-syncs new curated writers.
// Curated writers must have sufficient online presence to be added — Wikipedia
// coverage is the floor, so this should resolve cleanly in nearly every case.

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const WRITER_DATA_PATH = join(__dirname, "..", "src", "lib", "writer-data.ts");
const PHOTOS_PATH = join(__dirname, "..", "src", "lib", "writer-photos.ts");

// Wikipedia titles that disambiguate to the wrong article when queried by display name.
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

// Hand-curated photo URLs for writers Wikipedia can't auto-resolve (no infobox image,
// no article, or disambiguation is too noisy). Keep this list short — each entry is a
// commitment to maintain. WriterAvatar falls back to initials if a writer is omitted.
const MANUAL_PHOTOS: Record<string, string> = {
  "Matt Levine":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Matt_levine.jpg/250px-Matt_levine.jpg",
};

function parseCuratedNames(): string[] {
  const src = readFileSync(WRITER_DATA_PATH, "utf-8");
  const names: string[] = [];
  const re = /\{\s*name:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) names.push(m[1]);
  return names;
}

function parsePhotos(): Record<string, string> {
  const src = readFileSync(PHOTOS_PATH, "utf-8");
  const photos: Record<string, string> = {};
  const re = /"([^"]+)":\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) photos[m[1]] = m[2];
  return photos;
}

async function fetchPortrait(name: string): Promise<string | null> {
  const title = NAME_OVERRIDES[name] ?? encodeURIComponent(name.replace(/\s+/g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DoppelWriter/1.0 (https://doppelwriter.com)" },
    });
    if (!res.ok) {
      console.warn(`[sync-photos] ${name}: HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as {
      type?: string;
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
    };
    if (data.type === "disambiguation") {
      console.warn(`[sync-photos] ${name}: disambiguation — add NAME_OVERRIDES entry`);
      return null;
    }
    const src = data.thumbnail?.source ?? data.originalimage?.source ?? null;
    if (!src) {
      console.warn(`[sync-photos] ${name}: no image on Wikipedia article`);
      return null;
    }
    return src;
  } catch (err) {
    console.warn(`[sync-photos] ${name}: fetch error — ${err}`);
    return null;
  }
}

function writePhotos(photos: Record<string, string>) {
  const sorted = Object.keys(photos).sort((a, b) => a.localeCompare(b));
  const body = sorted
    .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(photos[k])},`)
    .join("\n");
  const file = `export const WRITER_PHOTOS: Record<string, string> = {\n${body}\n};\n`;
  writeFileSync(PHOTOS_PATH, file, "utf-8");
}

async function main() {
  const curated = parseCuratedNames();
  const photos = parsePhotos();

  // 1. Fix legacy key drift: "Ben Thompson (analyst)" → "Ben Thompson"
  if (photos["Ben Thompson (analyst)"] && !photos["Ben Thompson"]) {
    photos["Ben Thompson"] = photos["Ben Thompson (analyst)"];
  }

  // 2. Prune orphan entries (photos for writers no longer in the curated roster).
  const curatedSet = new Set(curated);
  const before = Object.keys(photos).length;
  for (const key of Object.keys(photos)) {
    if (!curatedSet.has(key)) {
      console.log(`[sync-photos] prune orphan: ${key}`);
      delete photos[key];
    }
  }
  const pruned = before - Object.keys(photos).length;

  // 3. Apply manual overrides (always — these win over Wikipedia auto-resolution).
  for (const [name, url] of Object.entries(MANUAL_PHOTOS)) {
    if (curatedSet.has(name)) photos[name] = url;
  }

  // 4. Backfill missing curated writers from Wikipedia.
  const missing = curated.filter((n) => !photos[n]);
  console.log(
    `[sync-photos] curated=${curated.length} have=${Object.keys(photos).length} missing=${missing.length} pruned=${pruned}`,
  );

  let added = 0;
  let failed = 0;
  for (const name of missing) {
    const src = await fetchPortrait(name);
    if (src) {
      photos[name] = src;
      added++;
      console.log(`[sync-photos] + ${name}`);
    } else {
      failed++;
    }
    // Polite throttle — Wikipedia REST is generous but no need to hammer.
    await new Promise((r) => setTimeout(r, 100));
  }

  writePhotos(photos);
  console.log(`[sync-photos] done. added=${added} failed=${failed} total=${Object.keys(photos).length}`);
  if (failed > 0) {
    console.log(`[sync-photos] ${failed} writer(s) need manual NAME_OVERRIDES entries.`);
  }
}

main().catch((err) => {
  console.error("[sync-photos] fatal:", err);
  process.exit(1);
});
