import type { NewEidgah, VenueType } from "./types";

const VENUE_VALUES: VenueType[] = ["eidgah", "masjid", "open_ground"];
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Normalise a time field to a valid "HH:MM" string, or null if absent. */
function parseTime(v: unknown): string | null | "invalid" {
  if (v == null || v === "") return null;
  if (typeof v !== "string") return "invalid";
  const t = v.trim();
  if (!t) return null;
  return TIME_RE.test(t) ? t : "invalid";
}

export type ParseResult =
  | { ok: true; value: NewEidgah }
  | { ok: false; error: string };

/** Validate a request body into a NewEidgah, shared by create and update. */
export function parseEidgahInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object") return { ok: false, error: "Body must be an object." };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const city = typeof b.city === "string" ? b.city.trim() : "";
  const area = typeof b.area === "string" ? b.area.trim() : "";
  const country = typeof b.country === "string" ? b.country.trim().toUpperCase() : "";
  const venue_type =
    typeof b.venue_type === "string" ? (b.venue_type as VenueType) : ("eidgah" as VenueType);
  const notes = typeof b.notes === "string" ? b.notes.trim() : "";
  const lat = typeof b.lat === "number" ? b.lat : Number(b.lat);
  const lng = typeof b.lng === "number" ? b.lng : Number(b.lng);

  const fitr = parseTime(b.fitr_time);
  const adha = parseTime(b.adha_time);

  if (!name) return { ok: false, error: "Venue name is required." };
  if (!city) return { ok: false, error: "City is required." };
  if (!country || !/^[A-Z]{2}$/.test(country)) {
    return { ok: false, error: "Country must be a 2-letter ISO code." };
  }
  if (!VENUE_VALUES.includes(venue_type)) {
    return { ok: false, error: "Venue type must be eidgah, masjid, or open_ground." };
  }
  if (fitr === "invalid") {
    return { ok: false, error: "Eid al-Fitr time must be in HH:MM 24-hour format." };
  }
  if (adha === "invalid") {
    return { ok: false, error: "Eid al-Adha time must be in HH:MM 24-hour format." };
  }
  if (!fitr && !adha) {
    return { ok: false, error: "Provide a prayer time for at least one Eid." };
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { ok: false, error: "Latitude must be a number between -90 and 90." };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { ok: false, error: "Longitude must be a number between -180 and 180." };
  }
  if (name.length > 160 || city.length > 120 || area.length > 120 || notes.length > 1000) {
    return { ok: false, error: "One of the fields exceeds the allowed length." };
  }

  return {
    ok: true,
    value: {
      name,
      city,
      country,
      area: area || null,
      venue_type,
      fitr_time: fitr,
      adha_time: adha,
      lat,
      lng,
      notes: notes || null,
    },
  };
}
