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

    ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS voice_overrides JSONB DEFAULT '{}';

    CREATE INDEX IF NOT EXISTS idx_samples_user ON writing_samples(user_id);
    CREATE INDEX IF NOT EXISTS idx_samples_user_date ON writing_samples(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_profiles_user ON style_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_curated ON style_profiles(is_curated);
    CREATE INDEX IF NOT EXISTS idx_profiles_user_curated ON style_profiles(user_id, is_curated);
    CREATE INDEX IF NOT EXISTS idx_profiles_writer ON style_profiles(writer_name);
    CREATE INDEX IF NOT EXISTS idx_drafts_user ON drafts(user_id);
    CREATE INDEX IF NOT EXISTS idx_drafts_user_date ON drafts(user_id, updated_at);
    CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_log(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_verifications_token ON email_verifications(token);

    CREATE TABLE IF NOT EXISTS shared_drafts (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      voice_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id SERIAL PRIMARY KEY,
      referrer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      referred_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      bonus_applied BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_sequence_sends (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      sequence_key TEXT NOT NULL,
      sent_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, sequence_key)
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_task TEXT;

    CREATE INDEX IF NOT EXISTS idx_shared_drafts_slug ON shared_drafts(slug);
    CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
    CREATE INDEX IF NOT EXISTS idx_email_sends_user ON email_sequence_sends(user_id);
  `;

  await db`
    CREATE TABLE IF NOT EXISTS email_captures (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      source TEXT,
      source_slug TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`CREATE INDEX IF NOT EXISTS idx_email_captures_source ON email_captures(source)`;

  await db`
    CREATE TABLE IF NOT EXISTS analyzer_results (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      input_preview TEXT NOT NULL,
      result JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`CREATE INDEX IF NOT EXISTS idx_analyzer_slug ON analyzer_results(slug)`;

  await db`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event TEXT NOT NULL,
      user_id TEXT,
      properties JSONB DEFAULT '{}',
      page TEXT,
      referrer TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event)`;
  await db`CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at)`;
  await db`CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id)`;

  await db`
    CREATE TABLE IF NOT EXISTS stripe_events (
      event_id TEXT PRIMARY KEY,
      processed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS writer_requests (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      writer_name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      status TEXT DEFAULT 'pending'
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS password_resets (
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
