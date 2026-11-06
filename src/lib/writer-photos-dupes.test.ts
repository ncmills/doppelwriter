import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { WRITER_PHOTOS } from "@/lib/writer-photos";

// Photo standard C1 (2026-11-02): no two writers share a photo — same file, same bytes, or the
// same shot at another crop. The last is caught by a difference hash of each photo AND of its
// centre crop, compared across every pair. sharp ships with next; no new dependency.
const file = (p: string) => path.join(process.cwd(), "public", p);

async function dhash(buf: Buffer, centre: boolean): Promise<bigint> {
  let img = sharp(buf).greyscale();
  if (centre) {
    const { width = 0, height = 0 } = await sharp(buf).metadata();
    img = img.extract({ left: Math.round(width * 0.2), top: Math.round(height * 0.2), width: Math.round(width * 0.6), height: Math.round(height * 0.6) });
  }
  const px = await img.resize(9, 8, { fit: "fill" }).raw().toBuffer();
  let h = BigInt(0);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) h = (h << BigInt(1)) | BigInt(px[y * 9 + x] > px[y * 9 + x + 1] ? 1 : 0);
  return h;
}
const bits = (n: bigint) => n.toString(2).replace(/0/g, "").length;

describe("no duplicate writer photos (photo standard C1)", () => {
  const entries = Object.entries(WRITER_PHOTOS);

  it("no two writers share a file or identical bytes", () => {
    const files = entries.map(([, f]) => f);
    expect(new Set(files).size).toBe(files.length);
    const sums = entries.map(([, f]) => createHash("sha256").update(readFileSync(file(f))).digest("hex"));
    expect(new Set(sums).size).toBe(sums.length);
  });

  it("no two writers show the same shot, even re-cropped (dHash distance > 10)", async () => {
    const hashes = await Promise.all(entries.map(async ([name, f]) => {
      const buf = readFileSync(file(f));
      return { name, full: await dhash(buf, false), centre: await dhash(buf, true) };
    }));
    const dupes: string[] = [];
    for (let i = 0; i < hashes.length; i++)
      for (let j = i + 1; j < hashes.length; j++) {
        const a = hashes[i], b = hashes[j];
        const d = Math.min(bits(a.full ^ b.full), bits(a.full ^ b.centre), bits(a.centre ^ b.full));
        if (d <= 10) dupes.push(`${a.name} vs ${b.name} (${d})`);
      }
    expect(dupes).toEqual([]);
  }, 60_000);

  it("the check fires on a re-cropped copy (positive control)", async () => {
    const buf = readFileSync(file(entries[0][1]));
    const { width = 0, height = 0 } = await sharp(buf).metadata();
    const crop = await sharp(buf).extract({ left: Math.round(width * 0.2), top: Math.round(height * 0.2), width: Math.round(width * 0.6), height: Math.round(height * 0.6) }).jpeg().toBuffer();
    expect(bits((await dhash(buf, true)) ^ (await dhash(crop, false)))).toBeLessThanOrEqual(10);
  });
});
