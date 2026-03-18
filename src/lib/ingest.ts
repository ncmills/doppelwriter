import { sql } from "./db";
import mammoth from "mammoth";

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export async function ingestText(
  userId: string,
  title: string,
  content: string,
  sourceType: string,
  sourcePath?: string
): Promise<{ id: number } | null> {
  if (wordCount(content) < 20) return null;

  const db = sql();
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

export async function ingestEmail(
  userId: string,
  emailId: string,
  subject: string,
  body: string
): Promise<{ id: number } | null> {
  const db = sql();

  // Dedup by source_path
  const existing = await db`
    SELECT id FROM writing_samples WHERE user_id = ${userId} AND source_path = ${"email:" + emailId}
  `;
  if (existing.length > 0) return null;

  const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return ingestText(userId, subject || "Email", text, "email", "email:" + emailId);
}

export async function getSamples(userId: string) {
  const db = sql();
  return db`
    SELECT ws.*,
      (SELECT string_agg(sp.name, ', ')
       FROM sample_profiles spp
       JOIN style_profiles sp ON sp.id = spp.profile_id
       WHERE spp.sample_id = ws.id) as categories
    FROM writing_samples ws
    WHERE ws.user_id = ${userId}
    ORDER BY ws.created_at DESC
  `;
}

export async function deleteSample(id: number, userId: string) {
  const db = sql();
  await db`DELETE FROM writing_samples WHERE id = ${id} AND user_id = ${userId}`;
}
