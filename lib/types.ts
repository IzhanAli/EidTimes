export type VenueType = "eidgah" | "masjid" | "open_ground";

export const VENUE_TYPES: { value: VenueType; label: string }[] = [
  { value: "eidgah", label: "Eidgah" },
  { value: "masjid", label: "Masjid" },
  { value: "open_ground", label: "Open ground" },
];

export type Occasion = "eid_al_fitr" | "eid_al_adha";

export const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: "eid_al_fitr", label: "Eid al-Fitr" },
  { value: "eid_al_adha", label: "Eid al-Adha" },
];

export function occasionLabel(o: Occasion): string {
  return OCCASIONS.find((x) => x.value === o)?.label ?? o;
}

/** The "HH:MM" time a venue holds the given Eid prayer, or null if it doesn't. */
export function timeForOccasion(
  e: { fitr_time: string | null; adha_time: string | null },
  o: Occasion
): string | null {
  return o === "eid_al_fitr" ? e.fitr_time : e.adha_time;
}

/** True if the venue lists a prayer time for the given occasion. */
export function hasOccasion(
  e: { fitr_time: string | null; adha_time: string | null },
  o: Occasion
): boolean {
  return Boolean(timeForOccasion(e, o));
}

/** Display string for an occasion + time, e.g. "Eid al-Fitr — 7:30 AM". */
export function timingLabel(o: Occasion, hhmm: string): string {
  return `${occasionLabel(o)} — ${formatTime12h(hhmm)}`;
}

/** The other Eid. */
export function otherOccasion(o: Occasion): Occasion {
  return o === "eid_al_fitr" ? "eid_al_adha" : "eid_al_fitr";
}

/**
 * Site-wide settings sourced from the database (remote-controllable).
 * `activeOccasion` decides which Eid the directory defaults to showing.
 */
export type SiteConfig = {
  activeOccasion: Occasion;
};

export const DEFAULT_SITE_CONFIG: SiteConfig = { activeOccasion: "eid_al_fitr" };

/** Format a "HH:MM" 24h string as "7:30 AM". Returns the input if unparseable. */
export function formatTime12h(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return hhmm;
  const h = Number(m[1]);
  const mins = m[2];
  if (!Number.isFinite(h) || h < 0 || h > 23) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mins} ${period}`;
}

/** Parse "HH:MM" to minutes-since-midnight, or null if unparseable. */
export function parseHhmm(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return null;
  }
  return h * 60 + min;
}

/**
 * Signed minutes from `now` until the prayer time *today*.
 * Negative means it already happened earlier today. Null if unparseable.
 */
export function minutesUntilToday(hhmm: string, now: Date): number | null {
  const target = parseHhmm(hhmm);
  if (target == null) return null;
  const cur = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  return target - cur;
}

export type Proximity = "soon" | "approaching" | "far" | "passed" | "unknown";

/**
 * Classify how soon a prayer time is relative to `now`:
 *   soon (≤60m, red) · approaching (≤180m, amber) · far (>180m, green) · passed (earlier today, grey).
 * Used both for the colour of the chip and the default "soonest first" sort.
 */
export function timeProximity(hhmm: string, now: Date): Proximity {
  const mins = minutesUntilToday(hhmm, now);
  if (mins == null) return "unknown";
  if (mins < 0) return "passed";
  if (mins <= 60) return "soon";
  if (mins <= 180) return "approaching";
  return "far";
}

/**
 * Sort key for "soonest first": upcoming prayers ascending by minutes-until,
 * with prayers that already happened today pushed to the end. Unparseable last.
 */
export function soonestSortKey(hhmm: string, now: Date): number {
  const mins = minutesUntilToday(hhmm, now);
  if (mins == null) return Number.POSITIVE_INFINITY;
  return mins >= 0 ? mins : 1440 + mins; // wrap passed times to "tomorrow"
}

/** Human label for a prayer time relative to now, e.g. "in 2h 15m" / "Earlier today". */
export function relativeTimeLabel(hhmm: string, now: Date): string {
  const mins = minutesUntilToday(hhmm, now);
  if (mins == null) return "—";
  if (mins < 0) return "Earlier today";
  const total = Math.round(mins);
  if (total === 0) return "Now";
  if (total < 60) return `in ${total}m`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}

/** Great-circle distance in kilometres between two lat/lng points. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Compact distance label, e.g. "850 m" / "4.2 km" / "37 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * One-click Google Maps URL. When `from` is given, opens turn-by-turn
 * directions from the user; otherwise drops a pin on the destination.
 */
export function gmapsUrl(
  dest: { lat: number; lng: number },
  from?: { lat: number; lng: number } | null
): string {
  const d = `${dest.lat},${dest.lng}`;
  if (from) {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${d}&travelmode=driving`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${d}`;
}

/** OpenStreetMap deep link for a point. */
export function osmUrl(p: { lat: number; lng: number }): string {
  return `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=17/${p.lat}/${p.lng}`;
}

/**
 * Embeddable OSM map URL (no API key) centred on a point with a marker,
 * for use as a card preview in an <iframe>. `d` controls the bbox half-width
 * in degrees — smaller = more zoomed in.
 */
export function osmEmbedUrl(p: { lat: number; lng: number }, d = 0.006): string {
  const minLng = p.lng - d;
  const maxLng = p.lng + d;
  const minLat = p.lat - d * 0.7;
  const maxLat = p.lat + d * 0.7;
  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(`${p.lat},${p.lng}`)}`;
}

export type LatLng = { lat: number; lng: number };

/** State of the browser geolocation request, shared across views. */
export type GeoStatus = "idle" | "locating" | "ok" | "error";

export type Eidgah = {
  id: string;
  name: string;
  city: string;
  country: string; // ISO-3166-1 alpha-2
  area: string | null; // locality / neighbourhood within the city
  venue_type: VenueType;
  // A venue may hold one or both Eids. "HH:MM" 24h, or null if not held here.
  fitr_time: string | null;
  adha_time: string | null;
  lat: number;
  lng: number;
  notes: string | null;
  created_at: string;
};

export type NewEidgah = Omit<Eidgah, "id" | "created_at">;
