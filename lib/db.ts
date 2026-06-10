import { sql } from "@vercel/postgres";
import type { Eidgah, NewEidgah, Occasion, SiteConfig } from "./types";
import { DEFAULT_SITE_CONFIG } from "./types";
import {
  mockListEidgahs,
  mockCreateEidgah,
  mockUpdateEidgah,
  mockGetSiteConfig,
} from "./mock-db";

// ─── REMOVABLE MOCK DB ──────────────────────────────────────────────────────
// With no Postgres connection configured (e.g. local dev), fall back to the
// in-memory mock store so the app has data to show. Set USE_MOCK_DB=0 to force
// the real database even without a URL. To remove: delete this block, the
// `mock-db.ts` file, and the import above.
const USE_MOCK =
  process.env.USE_MOCK_DB === "1" ||
  (process.env.USE_MOCK_DB !== "0" && !process.env.POSTGRES_URL);
// ────────────────────────────────────────────────────────────────────────────

export async function listEidgahs(): Promise<Eidgah[]> {
  if (USE_MOCK) return mockListEidgahs();
  const { rows } = await sql<Eidgah>`
    SELECT id, name, city, country, area, venue_type, fitr_time, adha_time,
           lat::float8 AS lat, lng::float8 AS lng,
           notes, created_at
    FROM eidgahs
    ORDER BY country ASC, city ASC, name ASC
  `;
  return rows;
}

/**
 * Site config (e.g. which Eid is active), read from the database so it can be
 * changed remotely without a redeploy. Falls back to the default on any error.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  if (USE_MOCK) return mockGetSiteConfig();
  try {
    const { rows } = await sql<{ value: string }>`
      SELECT value FROM app_config WHERE key = 'active_occasion' LIMIT 1
    `;
    const value = rows[0]?.value as Occasion | undefined;
    if (value === "eid_al_fitr" || value === "eid_al_adha") {
      return { activeOccasion: value };
    }
  } catch {
    // table may not exist yet — fall through to default
  }
  return DEFAULT_SITE_CONFIG;
}

export async function createEidgah(input: NewEidgah): Promise<Eidgah> {
  if (USE_MOCK) return mockCreateEidgah(input);
  const { rows } = await sql<Eidgah>`
    INSERT INTO eidgahs (
      name, city, country, area, venue_type, fitr_time, adha_time,
      lat, lng, notes
    )
    VALUES (
      ${input.name},
      ${input.city},
      ${input.country},
      ${input.area},
      ${input.venue_type},
      ${input.fitr_time},
      ${input.adha_time},
      ${input.lat},
      ${input.lng},
      ${input.notes}
    )
    RETURNING id, name, city, country, area, venue_type, fitr_time, adha_time,
              lat::float8 AS lat, lng::float8 AS lng,
              notes, created_at
  `;
  return rows[0];
}

export async function updateEidgah(
  id: string,
  input: NewEidgah
): Promise<Eidgah | null> {
  if (USE_MOCK) return mockUpdateEidgah(id, input);
  const { rows } = await sql<Eidgah>`
    UPDATE eidgahs SET
      name = ${input.name},
      city = ${input.city},
      country = ${input.country},
      area = ${input.area},
      venue_type = ${input.venue_type},
      fitr_time = ${input.fitr_time},
      adha_time = ${input.adha_time},
      lat = ${input.lat},
      lng = ${input.lng},
      notes = ${input.notes}
    WHERE id = ${id}
    RETURNING id, name, city, country, area, venue_type, fitr_time, adha_time,
              lat::float8 AS lat, lng::float8 AS lng,
              notes, created_at
  `;
  return rows[0] ?? null;
}
