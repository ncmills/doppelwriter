import { sql } from "./db";

export async function trackServerEvent(
  event: string,
  properties: Record<string, unknown> = {},
  userId?: string,
  page?: string,
) {
  try {
    const db = sql();
    await db`
      INSERT INTO analytics_events (event, user_id, properties, page)
      VALUES (${event}, ${userId || null}, ${JSON.stringify(properties)}, ${page || null})
    `;
  } catch {
    // Non-blocking — never fail a request because of analytics
  }
}
