import { readFileSync } from "fs";
import { join } from "path";

// Space Grotesk 700 for OG images, read from the bundled local file.
//
// Previously every prerendered opengraph-image route fetched this font from
// fonts.gstatic.com at build time. That network call failed intermittently and
// took the whole production build down with it (the fabricated-testimonials
// removal sat un-deployed on 2026-07-20 because of exactly this). Reading the
// local file removes the network dependency, so OG prerendering is
// deterministic. Node runtime only — the one edge/dynamic OG route
// (analyze/[slug]) keeps its own runtime fetch since it never runs at build.
let _cache: ArrayBuffer | null = null;
export function getOgFont(): ArrayBuffer {
  if (!_cache) {
    const buf = readFileSync(join(process.cwd(), "src/lib/og/space-grotesk-700.ttf"));
    _cache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
  return _cache;
}
