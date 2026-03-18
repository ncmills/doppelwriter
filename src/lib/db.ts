import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function sql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

export async function initSchema() {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      google_access_token TEXT,
      google_refresh_token TEXT,
      google_token_expiry TEXT,
      last_gmail_sync TIMESTAMPTZ,
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_verifications (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS writing_samples (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      source_type TEXT NOT NULL,
      source_path TEXT,
      title TEXT,
      content TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS style_profiles (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      description TEXT,
      writer_name TEXT,
      writer_bio TEXT,
      writer_category TEXT DEFAULT 'custom',
      is_curated BOOLEAN DEFAULT FALSE,
      profile_json TEXT,
      system_prompt TEXT,
      exemplar_passages JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS voice_corrections (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      profile_id INTEGER REFERENCES style_profiles(id) ON DELETE CASCADE,
      original_text TEXT NOT NULL,
      corrected_text TEXT NOT NULL,
      correction_type TEXT DEFAULT 'manual_edit',
      lesson TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sample_profiles (
      sample_id INTEGER REFERENCES writing_samples(id) ON DELETE CASCADE,
      profile_id INTEGER REFERENCES style_profiles(id) ON DELETE CASCADE,
      PRIMARY KEY (sample_id, profile_id)
    );

    CREATE TABLE IF NOT EXISTS drafts (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      profile_id INTEGER REFERENCES style_profiles(id),
      mode TEXT NOT NULL DEFAULT 'editor',
      brief TEXT,
      content TEXT NOT NULL,
      revisions JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS usage_log (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      tokens_used INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      profile_id INTEGER REFERENCES style_profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, profile_id)
    );

    CREATE INDEX IF NOT EXISTS idx_samples_user ON writing_samples(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_user ON style_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_curated ON style_profiles(is_curated);
    CREATE INDEX IF NOT EXISTS idx_drafts_user ON drafts(user_id);
    CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_log(user_id, created_at);
  `;
}
