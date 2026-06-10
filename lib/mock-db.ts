// ─────────────────────────────────────────────────────────────────────────
// REMOVABLE MOCK DB
//
// An in-memory stand-in for Vercel Postgres so the app runs locally without a
// database. Data lives in module scope: it survives across requests in a single
// server process but resets on restart. Created/edited entries are NOT persisted.
//
// To remove: delete this file and the mock block at the top of `lib/db.ts`.
// ─────────────────────────────────────────────────────────────────────────
import type { Eidgah, NewEidgah, SiteConfig } from "./types";

// ── Remote-controllable site config ──────────────────────────────────────
// In a real deployment this lives in a `settings` table; flip it there to
// change which Eid the whole site defaults to. Here it's a single value.
const mockConfig: SiteConfig = { activeOccasion: "eid_al_fitr" };

export async function mockGetSiteConfig(): Promise<SiteConfig> {
  return { ...mockConfig };
}

function seed(
  id: string,
  daysAgo: number,
  e: Omit<Eidgah, "id" | "created_at">
): Eidgah {
  // Dates are derived relative to a fixed anchor so seed data is deterministic.
  const anchor = new Date("2026-06-04T09:00:00Z").getTime();
  const created_at = new Date(anchor - daysAgo * 86_400_000).toISOString();
  return { ...e, id, created_at };
}

const store: Eidgah[] = [
  seed("mock-1", 1, {
    name: "Shahi Eidgah",
    city: "Delhi",
    country: "IN",
    area: "Old Delhi",
    venue_type: "eidgah",
    fitr_time: "06:30",
    adha_time: "06:45",
    lat: 28.6562,
    lng: 77.241,
    notes: "Large open eidgah near the old city. Arrive early; fills up fast.",
  }),
  seed("mock-2", 3, {
    name: "Jama Masjid",
    city: "Delhi",
    country: "IN",
    area: "Chandni Chowk",
    venue_type: "masjid",
    fitr_time: "07:00",
    adha_time: "07:00",
    lat: 28.6507,
    lng: 77.2334,
    notes: null,
  }),
  seed("mock-3", 2, {
    name: "Bandra Eidgah",
    city: "Mumbai",
    country: "IN",
    area: "Bandra West",
    venue_type: "eidgah",
    fitr_time: "07:15",
    adha_time: "07:30",
    lat: 19.0596,
    lng: 72.8295,
    notes: "Street parking is limited — use the station and walk.",
  }),
  seed("mock-4", 8, {
    name: "Minara Masjid",
    city: "Mumbai",
    country: "IN",
    area: "Mohammed Ali Road",
    venue_type: "masjid",
    fitr_time: null,
    adha_time: "06:45",
    lat: 18.958,
    lng: 72.8324,
    notes: "Eid al-Adha jamaat only.",
  }),
  seed("mock-5", 5, {
    name: "Eidgah Maidan",
    city: "Bengaluru",
    country: "IN",
    area: "Shivajinagar",
    venue_type: "open_ground",
    fitr_time: "07:30",
    adha_time: "07:45",
    lat: 12.9716,
    lng: 77.5946,
    notes: "Bring your own ja-namaz; ground can be dusty.",
  }),
  seed("mock-6", 4, {
    name: "Mecca Masjid",
    city: "Hyderabad",
    country: "IN",
    area: "Charminar",
    venue_type: "masjid",
    fitr_time: "06:45",
    adha_time: "07:00",
    lat: 17.3604,
    lng: 78.4736,
    notes: null,
  }),
  seed("mock-7", 6, {
    name: "Mir Alam Eidgah",
    city: "Hyderabad",
    country: "IN",
    area: "Bahadurpura",
    venue_type: "eidgah",
    fitr_time: "06:30",
    adha_time: "07:00",
    lat: 17.35,
    lng: 78.46,
    notes: null,
  }),
  seed("mock-8", 7, {
    name: "Tipu Sultan Masjid",
    city: "Kolkata",
    country: "IN",
    area: "Esplanade",
    venue_type: "masjid",
    fitr_time: "07:00",
    adha_time: null,
    lat: 22.5675,
    lng: 88.352,
    notes: "Eid al-Fitr jamaat only.",
  }),
];

let counter = store.length;

export async function mockListEidgahs(): Promise<Eidgah[]> {
  return [...store].sort(
    (a, b) =>
      a.country.localeCompare(b.country) ||
      a.city.localeCompare(b.city) ||
      a.name.localeCompare(b.name)
  );
}

export async function mockCreateEidgah(input: NewEidgah): Promise<Eidgah> {
  const row: Eidgah = {
    ...input,
    id: `mock-${++counter}`,
    created_at: new Date().toISOString(),
  };
  store.unshift(row);
  return row;
}

export async function mockUpdateEidgah(
  id: string,
  input: NewEidgah
): Promise<Eidgah | null> {
  const idx = store.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated: Eidgah = { ...store[idx], ...input, id };
  store[idx] = updated;
  return updated;
}
