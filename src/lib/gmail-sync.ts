import { gmail, auth } from "googleapis/build/src/apis/gmail";
import { sql } from "./db";
import { ingestText } from "./ingest";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/auth/callback/google";

export async function syncGmail(userId: string): Promise<{ synced: number; skipped: number }> {
  const oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  const db = sql();

  // Get user's Google tokens
  const [user] = await db`
    SELECT google_access_token, google_refresh_token, google_token_expiry FROM users WHERE id = ${userId}
  `;

  if (!user?.google_refresh_token) {
    throw new Error("Gmail not connected. Please connect your Google account first.");
  }

  oauth2Client.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
    expiry_date: user.google_token_expiry ? Number(user.google_token_expiry) : undefined,
  });

  // Refresh token if needed
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  // Save refreshed tokens
  await db`
    UPDATE users SET
      google_access_token = ${credentials.access_token || null},
      google_refresh_token = ${credentials.refresh_token || user.google_refresh_token},
      google_token_expiry = ${credentials.expiry_date ? String(credentials.expiry_date) : null}
    WHERE id = ${userId}
  `;

  const gmailClient = gmail({ version: "v1", auth: oauth2Client });

  // Get last sync timestamp
  const [syncRecord] = await db`
    SELECT last_gmail_sync FROM users WHERE id = ${userId}
  `;
  const lastSync = syncRecord?.last_gmail_sync;

  // Build query — sent emails after last sync
  let query = "in:sent";
  if (lastSync) {
    const afterDate = new Date(lastSync);
    const formatted = `${afterDate.getFullYear()}/${afterDate.getMonth() + 1}/${afterDate.getDate()}`;
    query += ` after:${formatted}`;
  }

  let synced = 0;
  let skipped = 0;
  let pageToken: string | undefined;

  do {
    const listRes = await gmailClient.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 50,
      pageToken,
    });

    const messages = listRes.data.messages || [];
    pageToken = listRes.data.nextPageToken || undefined;

    for (const msg of messages) {
      if (!msg.id) continue;

      // Check if already ingested
      const existing = await db`
        SELECT id FROM writing_samples WHERE user_id = ${userId} AND source_path = ${"gmail:" + msg.id}
      `;
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      try {
        const fullMsg = await gmailClient.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });

        const headers = fullMsg.data.payload?.headers || [];
        const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "No subject";
        const date = headers.find((h) => h.name?.toLowerCase() === "date")?.value || "";

        // Extract body text
        const body = extractBody(fullMsg.data.payload);
        if (!body || body.split(/\s+/).length < 30) {
          skipped++;
          continue;
        }

        const result = await ingestText(
          userId,
          `${subject} (${new Date(date).toLocaleDateString()})`,
          body,
          "email",
          "gmail:" + msg.id
        );

        if (result) synced++;
        else skipped++;
      } catch {
        skipped++;
      }
    }

    // Rate limit — don't hammer Gmail API
    if (pageToken) {
      await new Promise((r) => setTimeout(r, 200));
    }
  } while (pageToken);

  // Update last sync timestamp
  await db`UPDATE users SET last_gmail_sync = NOW() WHERE id = ${userId}`;

  // If new emails were synced, re-analyze the profile then purge raw data.
  // The raw email text is only kept long enough to extract voice patterns.
  if (synced > 0) {
    const profiles = await db`
      SELECT id FROM style_profiles WHERE user_id = ${userId} AND is_curated = FALSE
    `;
    for (const profile of profiles) {
      // Re-generate profile with new samples included
      const { generateProfile } = await import("./style-analyzer");
      await generateProfile(profile.id);
    }
    // Purge all raw samples — only the refined profile persists
    await db`DELETE FROM writing_samples WHERE user_id = ${userId}`;
  }

  return { synced, skipped };
}

function extractBody(payload: unknown): string {
  const p = payload as {
    mimeType?: string;
    body?: { data?: string };
    parts?: unknown[];
  };

  if (!p) return "";

  // Plain text part
  if (p.mimeType === "text/plain" && p.body?.data) {
    return Buffer.from(p.body.data, "base64url").toString("utf-8")
      .replace(/\r\n/g, "\n")
      .replace(/^>.*$/gm, "") // Remove quoted replies
      .replace(/On .+ wrote:[\s\S]*$/, "") // Remove reply chains
      .replace(/--\s*\n[\s\S]*$/, "") // Remove signatures
      .trim();
  }

  // Multipart — recurse into parts
  if (p.parts) {
    for (const part of p.parts) {
      const text = extractBody(part);
      if (text) return text;
    }
  }

  // HTML fallback
  if (p.mimeType === "text/html" && p.body?.data) {
    const html = Buffer.from(p.body.data, "base64url").toString("utf-8");
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "";
}

export async function isGmailConnected(userId: string): Promise<boolean> {
  const db = sql();
  const [user] = await db`
    SELECT google_refresh_token FROM users WHERE id = ${userId}
  `;
  return !!user?.google_refresh_token;
}
