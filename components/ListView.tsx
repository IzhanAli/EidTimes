"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ListBullets,
  GridFour,
  NavigationArrow,
  MagnifyingGlass,
  PencilSimple,
  MapPin,
} from "@phosphor-icons/react";
import type { Eidgah, GeoStatus, LatLng, Occasion, Proximity, VenueType } from "@/lib/types";
import { countryName } from "@/lib/countries";
import {
  formatDistance,
  formatTime12h,
  gmapsUrl,
  haversineKm,
  occasionLabel,
  osmEmbedUrl,
  osmUrl,
  relativeTimeLabel,
  soonestSortKey,
  timeForOccasion,
  timeProximity,
} from "@/lib/types";

const VENUE_LABEL: Record<VenueType, string> = {
  eidgah: "Eidgah",
  masjid: "Masjid",
  open_ground: "Open ground",
};

const VENUE_CLASS: Record<VenueType, string> = {
  eidgah: "badge badge-eidgah",
  masjid: "badge badge-masjid",
  open_ground: "badge badge-ground",
};

// Colour the headline time by how soon the prayer is — upcoming is graded
// green→amber→red, while a prayer that's already passed reads as "gone".
const TIME_COLOR: Record<Proximity, string> = {
  far: "text-emerald-deep",
  approaching: "text-saffron-deep",
  soon: "text-plum",
  passed: "text-ink-subtle line-through decoration-2 decoration-ink-subtle/50",
  unknown: "text-ink",
};

type Sort = "soonest" | "distance" | "name" | "city" | "recent";
type Layout = "list" | "grid";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "soonest", label: "Soonest (by time)" },
  { value: "distance", label: "Nearest to me" },
  { value: "name", label: "Name A–Z" },
  { value: "city", label: "By city" },
  { value: "recent", label: "Recently added" },
];

function sortEidgahs(
  list: Eidgah[],
  sort: Sort,
  now: Date | null,
  userLoc: LatLng | null,
  occasion: Occasion
): Eidgah[] {
  const pt = (e: Eidgah) => timeForOccasion(e, occasion) ?? "";
  const arr = [...list];
  switch (sort) {
    case "soonest":
      if (!now) return arr;
      return arr.sort(
        (a, b) =>
          soonestSortKey(pt(a), now) - soonestSortKey(pt(b), now) ||
          a.name.localeCompare(b.name)
      );
    case "distance":
      if (!userLoc) return arr.sort((a, b) => a.name.localeCompare(b.name));
      return arr.sort((a, b) => haversineKm(userLoc, a) - haversineKm(userLoc, b));
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "recent":
      return arr.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    default:
      return arr;
  }
}

function groupByCity(items: Eidgah[], now: Date | null, occasion: Occasion) {
  const pt = (e: Eidgah) => timeForOccasion(e, occasion) ?? "";
  const map = new Map<string, Eidgah[]>();
  for (const e of items) {
    const key = `${e.city}__${e.country}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries())
    .map(([key, list]) => {
      const [city, country] = key.split("__");
      const sorted = now
        ? [...list].sort((a, b) => soonestSortKey(pt(a), now) - soonestSortKey(pt(b), now))
        : list;
      return { city, country, items: sorted };
    })
    .sort((a, b) => a.city.localeCompare(b.city));
}

function EidgahCard({
  e,
  now,
  userLoc,
  layout,
  showPreview,
  occasion,
  onEdit,
  index = 0,
}: {
  e: Eidgah;
  now: Date | null;
  userLoc: LatLng | null;
  layout: Layout;
  showPreview: boolean;
  occasion: Occasion;
  onEdit: (e: Eidgah) => void;
  index?: number;
}) {
  // The list is pre-filtered to venues that hold this occasion, so a time exists.
  const ptime = timeForOccasion(e, occasion) ?? "";
  const prox = now ? timeProximity(ptime, now) : "unknown";
  const relLabel = now ? relativeTimeLabel(ptime, now) : formatTime12h(ptime);
  const dist = userLoc ? haversineKm(userLoc, e) : null;
  const isList = layout === "list";

  const preview = showPreview ? (
    <a
      href={osmUrl(e)}
      target="_blank"
      rel="noreferrer"
      className={`relative bg-paper-line/40 group ${
        isList ? "hidden sm:block w-44 md:w-52 shrink-0 min-h-[7rem]" : "block h-32"
      }`}
      title="Open in OpenStreetMap"
    >
      <iframe
        src={osmEmbedUrl(e)}
        title={`Map preview of ${e.name}`}
        loading="lazy"
        className="h-full w-full border-0 pointer-events-none"
      />
      {/* overlay keeps the whole preview clickable through to OSM */}
      <span className="absolute inset-0" aria-hidden />
    </a>
  ) : null;

  const content = (
    <div className="p-4 flex flex-col gap-3 flex-1 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-serif text-lg leading-snug text-ink">{e.name}</h4>
        <span className={VENUE_CLASS[e.venue_type]}>{VENUE_LABEL[e.venue_type]}</span>
      </div>

      {/* High-contrast prayer time — the headline of the card */}
      <div>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span
            className={`font-serif text-3xl font-semibold leading-none tracking-tightish ${TIME_COLOR[prox]}`}
          >
            {formatTime12h(ptime)}
          </span>
          <span className={`prox-chip prox-${prox}`}>
            <span className="prox-dot" />
            {relLabel}
          </span>
        </div>
        <div className="eyebrow-muted mt-1.5">{occasionLabel(occasion)}</div>
      </div>

      {dist != null && (
        <div className="text-xs text-ink-muted">
          <span className="eyebrow mr-1.5">Distance</span>~{formatDistance(dist)} away
        </div>
      )}

      {e.notes && <p className="text-sm text-ink-muted leading-snug">{e.notes}</p>}

      <div className="mt-auto pt-3 border-t border-paper-line/70 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted min-w-0">
          <MapPin size={15} weight="fill" className="text-emerald shrink-0" />
          <span className="truncate">{e.area || e.city}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(e)}
            className="btn btn-ghost h-8 px-2.5 text-xs"
            title="Edit this entry"
          >
            <PencilSimple size={14} /> Edit
          </button>
          <a
            className="btn btn-primary h-8 px-3 text-xs"
            href={gmapsUrl(e, userLoc)}
            target="_blank"
            rel="noreferrer"
          >
            <NavigationArrow size={14} weight="fill" />
            {userLoc ? "Directions" : "Get directions"}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <li
      className={`bg-paper-card border border-paper-line rounded-sm overflow-hidden flex hover:border-emerald/60 card-enter card-lift card-accent-${prox} ${
        isList ? "flex-row items-stretch" : "flex-col"
      }`}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      {/* list: content left, map right · grid: map top, content below */}
      {isList ? (
        <>
          {content}
          {preview}
        </>
      ) : (
        <>
          {preview}
          {content}
        </>
      )}
    </li>
  );
}

export default function ListView({
  eidgahs,
  occasion,
  userLoc,
  geoStatus,
  geoError,
  onRequestLocation,
  onEdit,
  showMapPreviews = false,
}: {
  eidgahs: Eidgah[];
  occasion: Occasion;
  userLoc: LatLng | null;
  geoStatus: GeoStatus;
  geoError: string | null;
  onRequestLocation: () => void;
  onEdit: (e: Eidgah) => void;
  showMapPreviews?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("soonest");
  const [layout, setLayout] = useState<Layout>("list");
  const [now, setNow] = useState<Date | null>(null);

  // Tick the clock client-side so colours/labels stay live without an SSR mismatch.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // If the user asks to sort by distance but we don't have a fix yet, request it.
  useEffect(() => {
    if (sort === "distance" && !userLoc && geoStatus === "idle") {
      onRequestLocation();
    }
  }, [sort, userLoc, geoStatus, onRequestLocation]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eidgahs;
    return eidgahs.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        (e.notes ?? "").toLowerCase().includes(q)
    );
  }, [eidgahs, query]);

  const sortedFlat = useMemo(
    () => sortEidgahs(filtered, sort, now, userLoc, occasion),
    [filtered, sort, now, userLoc, occasion]
  );
  const grouped = useMemo(
    () => groupByCity(filtered, now, occasion),
    [filtered, now, occasion]
  );

  // List = stacked full-width rows; grid = responsive card columns.
  const gridClass =
    layout === "list"
      ? "flex flex-col gap-4"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

  const locLabel =
    geoStatus === "locating"
      ? "Locating…"
      : geoStatus === "ok"
        ? "Located · refresh"
        : geoStatus === "error"
          ? "Retry location"
          : "Use my location";

  return (
    <section>
      <div className="flex items-end gap-3 mb-6 flex-wrap">
        <div>
          <span className="field-label block mb-1.5">Layout</span>
          <div
            role="tablist"
            aria-label="Layout"
            className="inline-flex border border-paper-line rounded-sm overflow-hidden bg-paper-card h-9"
          >
            <button
              role="tab"
              aria-selected={layout === "list"}
              onClick={() => setLayout("list")}
              className={`px-3 inline-flex items-center gap-1.5 text-sm transition ${
                layout === "list" ? "bg-emerald text-paper" : "text-ink hover:bg-emerald-soft"
              }`}
              title="List view"
            >
              <ListBullets size={16} weight={layout === "list" ? "fill" : "regular"} />
              List
            </button>
            <button
              role="tab"
              aria-selected={layout === "grid"}
              onClick={() => setLayout("grid")}
              className={`px-3 inline-flex items-center gap-1.5 text-sm border-l border-paper-line transition ${
                layout === "grid" ? "bg-emerald text-paper" : "text-ink hover:bg-emerald-soft"
              }`}
              title="Grid view"
            >
              <GridFour size={16} weight={layout === "grid" ? "fill" : "regular"} />
              Grid
            </button>
          </div>
        </div>

        <div>
          <span className="field-label block mb-1.5">Near me</span>
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={geoStatus === "locating"}
            className="btn btn-ghost inline-flex items-center gap-1.5 disabled:opacity-60"
            title="Detect your current location to sort by distance and get directions"
          >
            <NavigationArrow size={16} weight="fill" /> {locLabel}
          </button>
        </div>

        <div>
          <label htmlFor="sort" className="field-label block mb-1.5">
            Sort
          </label>
          <select
            id="sort"
            className="field-input"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value === "distance" && !userLoc ? `${o.label} (uses location)` : o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[12rem] max-w-[18rem]">
          <label htmlFor="search" className="field-label block mb-1.5">
            Search
          </label>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
            />
            <input
              id="search"
              className="field-input pl-8"
              placeholder="City, name, or notes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Location status — only shown once a fix succeeds or fails */}
      {((geoStatus === "ok" && userLoc) || (geoStatus === "error" && geoError)) && (
        <div className="mb-6 text-xs">
          {geoStatus === "ok" && userLoc ? (
            <span className="text-emerald-deep">Distances shown from your location.</span>
          ) : (
            <span className="text-plum">{geoError}</span>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="border border-dashed border-paper-line rounded-sm p-10 text-center text-ink-muted bg-paper-card">
          Nothing's here Add the first one.
        </div>
      ) : sort === "city" ? (
        <div className="space-y-10">
          {grouped.map(({ city, country, items }) => (
            <div key={`${city}-${country}`}>
              <div className="flex items-baseline justify-between border-b-2 border-emerald/30 pb-2 mb-4">
                <h3 className="font-serif text-xl text-emerald-deep">
                  {city}
                  <span className="text-ink-subtle font-sans text-sm ml-2">
                    · {countryName(country)}
                  </span>
                </h3>
                <span className="eyebrow-muted">{items.length} listed</span>
              </div>
              <ul className={gridClass}>
                {items.map((e, i) => (
                  <EidgahCard
                    key={`${occasion}-${e.id}`}
                    index={i}
                    e={e}
                    now={now}
                    userLoc={userLoc}
                    layout={layout}
                    showPreview={showMapPreviews}
                    occasion={occasion}
                    onEdit={onEdit}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className={gridClass}>
          {sortedFlat.map((e, i) => (
            <EidgahCard
              key={`${occasion}-${e.id}`}
              index={i}
              e={e}
              now={now}
              userLoc={userLoc}
              layout={layout}
              showPreview={showMapPreviews}
              occasion={occasion}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
