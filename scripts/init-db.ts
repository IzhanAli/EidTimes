import { sql } from "@vercel/postgres";

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS eidgahs (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name         TEXT NOT NULL,
      city         TEXT NOT NULL,
      country      TEXT NOT NULL DEFAULT 'XX',
      area         TEXT,
      venue_type   TEXT NOT NULL DEFAULT 'eidgah',
      fitr_time    TEXT,
      adha_time    TEXT,
      lat          DOUBLE PRECISION NOT NULL,
      lng          DOUBLE PRECISION NOT NULL,
      notes        TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Idempotent migrations for existing deployments
  await sql`ALTER TABLE eidgahs ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'XX'`;
  await sql`ALTER TABLE eidgahs ADD COLUMN IF NOT EXISTS venue_type TEXT NOT NULL DEFAULT 'eidgah'`;
  await sql`ALTER TABLE eidgahs ADD COLUMN IF NOT EXISTS area TEXT`;
  await sql`ALTER TABLE eidgahs ADD COLUMN IF NOT EXISTS fitr_time TEXT`;
  await sql`ALTER TABLE eidgahs ADD COLUMN IF NOT EXISTS adha_time TEXT`;
  // Backfill from the older single-occasion columns if they still exist.
  await sql`
    UPDATE eidgahs SET fitr_time = prayer_time
    WHERE fitr_time IS NULL AND occasion = 'eid_al_fitr' AND prayer_time IS NOT NULL
  `.catch(() => {});
  await sql`
    UPDATE eidgahs SET adha_time = prayer_time
    WHERE adha_time IS NULL AND occasion = 'eid_al_adha' AND prayer_time IS NOT NULL
  `.catch(() => {});
  await sql`CREATE INDEX IF NOT EXISTS eidgahs_city_idx ON eidgahs (city)`;
  await sql`CREATE INDEX IF NOT EXISTS eidgahs_country_idx ON eidgahs (country)`;

  // Site config table for remote-controllable settings (e.g. active occasion).
  await sql`
    CREATE TABLE IF NOT EXISTS app_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
  await sql`
    INSERT INTO app_config (key, value) VALUES ('active_occasion', 'eid_al_fitr')
    ON CONFLICT (key) DO NOTHING
  `;

  // Per-IP rate limiting store for write endpoints. One row per accepted hit;
  // rows are pruned by window on each check (see lib/rate-limit.ts).
  await sql`
    CREATE TABLE IF NOT EXISTS rate_hits (
      id     BIGSERIAL PRIMARY KEY,
      ip     TEXT NOT NULL,
      bucket TEXT NOT NULL,
      ts     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS rate_hits_lookup_idx ON rate_hits (ip, bucket, ts)`;

  console.log("eidgahs + app_config + rate_hits tables ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
