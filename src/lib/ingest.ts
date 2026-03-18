import { sql } from "./db";
import mammoth from "mammoth";

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// Temporary staging — samples are stored only until profile is built,
// then deleted. We never persist raw user writing long-term.

export async function ingestText(
  userId: string,
  title: string,
  content: string,
  sourceType: string,
  sourcePath?: string
): Promise<{ id: number } | null> {
  if (wordCount(content) < 20) return null;

  const db = sql();

  // Dedup by source_path if provided
  if (sourcePath) {
    const existing = await db`
      SELECT id FROM writing_samples WHERE user_id = ${userId} AND source_path = ${sourcePath}
    `;
    if (existing.length > 0) return null;
  }

  const [row] = await db`
    INSERT INTO writing_samples (user_id, source_type, source_path, title, content, word_count)
    VALUES (${userId}, ${sourceType}, ${sourcePath || null}, ${title}, ${content}, ${wordCount(content)})
    RETURNING id
  `;
  return { id: row.id };
}

export async function ingestDocx(
  userId: string,
  title: string,
  buffer: Buffer
): Promise<{ id: number } | null> {
  const result = await mammoth.extractRawText({ buffer });
  return ingestText(userId, title, result.value, "upload", title);
}

export async function getSamples(userId: string) {
  const db = sql();
  return db`
    SELECT ws.id, ws.title, ws.source_type, ws.word_count, ws.created_at,
      (SELECT string_agg(sp.name, ', ')
       FROM sample_profiles spp
       JOIN style_profiles sp ON sp.id = spp.profile_id
       WHERE spp.sample_id = ws.id) as categories
    FROM writing_samples ws
    WHERE ws.user_id = ${userId}
    ORDER BY ws.created_at DESC
  `;
}

export async function getSampleCount(userId: string): Promise<number> {
  const db = sql();
  const [row] = await db`SELECT COUNT(*)::int as count FROM writing_samples WHERE user_id = ${userId}`;
  return row?.count || 0;
}

export async function deleteSample(id: number, userId: string) {
  const db = sql();
  await db`DELETE FROM writing_samples WHERE id = ${id} AND user_id = ${userId}`;
}

// Delete all raw writing samples for a user after profile has been built.
// Only the extracted style profile + exemplar passages persist.
export async function purgeRawSamples(userId: string): Promise<number> {
  const db = sql();
  const [row] = await db`
    DELETE FROM writing_samples WHERE user_id = ${userId} RETURNING id
  `;
  // sample_profiles cascade-deletes with the samples
  return row ? 1 : 0;
}

export async function getTotalWordCount(userId: string): Promise<number> {
  const db = sql();
  const [row] = await db`
    SELECT COALESCE(SUM(word_count), 0)::int as total FROM writing_samples WHERE user_id = ${userId}
  `;
  return row?.total || 0;
}
