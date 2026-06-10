# Eidgah Times

A community-maintained directory of Eid prayer locations and times. Two primary
views — a grouped city list and a map — and an "Add an eidgah" form that any
visitor can use (name, city, lat/long, timing, notes).

## Stack

- **Next.js 14** (App Router, TypeScript) + **Tailwind CSS**
- **Vercel Postgres** (`@vercel/postgres`) for storage
- **React-Leaflet** + OpenStreetMap tiles for the map (no API key needed)

## Local setup

```bash
npm install

# 1. Provision a Vercel Postgres database from your Vercel project's Storage tab.
# 2. Pull the env vars into the repo:
vercel link
vercel env pull .env.local

# 3. Create the table:
npm run db:init

# 4. Dev server:
npm run dev
```

Visit http://localhost:3000.

## Schema

A single `eidgahs` table:

| column     | type              | notes                          |
| ---------- | ----------------- | ------------------------------ |
| id         | uuid pk           | `gen_random_uuid()`               |
| name       | text              | venue name                        |
| city       | text              | grouping key for the list view    |
| country    | text              | ISO-3166-1 alpha-2                 |
| area       | text nullable     | locality shown on the card        |
| venue_type | text              | eidgah / masjid / open_ground     |
| fitr_time  | text nullable     | Eid al-Fitr time "HH:MM", or null |
| adha_time  | text nullable     | Eid al-Adha time "HH:MM", or null |
| lat        | double precision  | -90..90                           |
| lng        | double precision  | -180..180                         |
| notes      | text nullable     | optional                          |
| created_at | timestamptz       | default `NOW()`                   |

A venue may hold one or both Eids; at least one of `fitr_time` / `adha_time` is
required. The UI shows one occasion at a time (toggled in the navbar); the
default occasion is read from the `app_config` table (`active_occasion`), so it
can be changed remotely. `scripts/init-db.ts` creates both tables and indexes.

For local development without a database, an in-memory mock store
(`lib/mock-db.ts`) is used automatically when `POSTGRES_URL` is unset — seeded
with sample venues. Force it on/off with `USE_MOCK_DB=1` / `USE_MOCK_DB=0`.

## API

- `GET /api/eidgahs` → `{ data: Eidgah[] }`
- `POST /api/eidgahs` body
  `{ name, city, country, area?, venue_type, fitr_time?, adha_time?, lat, lng, notes? }`
  → `{ data: Eidgah }` (at least one of the two times required)
- `PATCH /api/eidgahs/:id` — same body shape; edits an existing entry →
  `{ data: Eidgah }`

Validation happens server-side; the routes refuse out-of-range coordinates,
over-long fields, and entries with no prayer time.

## Going further

- **Moderation:** add an `approved` boolean defaulting to `false` and a tiny
  admin route; show only approved rows in `listEidgahs()`.
- **Rate limiting:** Upstash Redis + a per-IP token bucket on `POST`.
- **Auth:** `next-auth` with a single magic-link provider so contributors can
  edit their own entries.
- **Spatial queries** ("eidgahs within 10km of me"): enable the `cube` and
  `earthdistance` extensions on Postgres and switch to `earth_distance`, or move
  to a Postgres with PostGIS.
