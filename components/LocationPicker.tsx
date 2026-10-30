"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { CircleNotch, Crosshair, MagnifyingGlass } from "@phosphor-icons/react";
import type { LatLng, VenueType } from "@/lib/types";

// Free OSM geocoder; called on explicit search and debounced city changes only,
// well within its 1 req/s policy.
const NOMINATIM = "https://nominatim.openstreetmap.org/search";

type Place = { display_name: string; lat: string; lon: string };
type View = { center: LatLng; zoom: number };

async function geocode(q: string, opts: { countryCode?: string; viewbox?: string } = {}) {
  const params = new URLSearchParams({ format: "jsonv2", limit: "5", q });
  if (opts.countryCode) params.set("countrycodes", opts.countryCode.toLowerCase());
  if (opts.viewbox) params.set("viewbox", opts.viewbox);
  const res = await fetch(`${NOMINATIM}?${params}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Search failed.");
  return (await res.json()) as Place[];
}

function pinFor(type: VenueType) {
  return L.divIcon({
    className: "",
    html: `<span class="eidgah-pin type-${type}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });
}

function ClickToPlace({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Moves the map when `view` changes (search result, city lookup, locate). */
function ViewController({ view }: { view: View | null }) {
  const map = useMap();
  useEffect(() => {
    if (view) map.setView([view.center.lat, view.center.lng], view.zoom);
  }, [view, map]);
  return null;
}

/** Brings the pin into view when it lands off-screen (typed coordinates, editing an entry). */
function KeepPinInView({ value }: { value: LatLng | null }) {
  const map = useMap();
  const lat = value?.lat;
  const lng = value?.lng;
  useEffect(() => {
    if (lat == null || lng == null) return;
    if (!map.getBounds().contains([lat, lng])) {
      map.setView([lat, lng], Math.max(map.getZoom(), 15));
    }
  }, [lat, lng, map]);
  return null;
}

function MapHandle({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  mapRef.current = useMap();
  return null;
}

/** Leaflet measures once at mount; re-measure as the drawer slides in or resizes. */
function TrackSize() {
  const map = useMap();
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map]);
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
  venueType,
  cityQuery,
  countryCode,
}: {
  /** Raw field text, so people who know coordinates can still type them. */
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
  venueType: VenueType;
  /** e.g. "Hyderabad, India" — centres the map while no pin is set. */
  cityQuery: string;
  countryCode: string;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [busy, setBusy] = useState<"search" | "locate" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const value = parseLatLng(lat, lng);
  const hasPin = value !== null;

  function place(p: LatLng) {
    onChange(p.lat.toFixed(6), p.lng.toFixed(6));
    setNotice(null);
  }

  // Follow the city field until a pin is dropped, so the map opens where the venue is.
  useEffect(() => {
    if (hasPin || !cityQuery.trim()) return;
    let cancelled = false;
    const t = setTimeout(() => {
      geocode(cityQuery, { countryCode })
        .then((places) => {
          if (!cancelled && places[0]) {
            setView({ center: { lat: Number(places[0].lat), lng: Number(places[0].lon) }, zoom: 13 });
          }
        })
        .catch(() => {});
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [cityQuery, countryCode, hasPin]);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setBusy("search");
    setNotice(null);
    try {
      // Bias (not restrict) results towards what's on screen.
      const b = mapRef.current?.getBounds();
      const viewbox = b
        ? [b.getWest(), b.getNorth(), b.getEast(), b.getSouth()].map((n) => n.toFixed(4)).join(",")
        : undefined;
      const places = await geocode(q, { viewbox });
      setResults(places);
      if (!places.length) setNotice("No matches — try a landmark nearby.");
    } catch {
      setNotice("Search is unavailable. Tap the map instead.");
    } finally {
      setBusy(null);
    }
  }

  function choose(p: Place) {
    const point = { lat: Number(p.lat), lng: Number(p.lon) };
    place(point);
    setView({ center: point, zoom: 17 });
    setResults(null);
    setQuery(p.display_name.split(",")[0]);
  }

  function locate() {
    if (!("geolocation" in navigator)) {
      setNotice("Location isn't available in this browser.");
      return;
    }
    setBusy("locate");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        place(point);
        setView({ center: point, zoom: 17 });
        setBusy(null);
      },
      (err) => {
        setNotice(err.message || "Couldn't read your location.");
        setBusy(null);
      }
    );
  }

  const initialCenter: [number, number] = value ? [value.lat, value.lng] : [20.5937, 78.9629];

  return (
    <div className="space-y-2">
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
        />
        <input
          className="field-input pl-9 pr-9"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResults(null);
          }}
          onKeyDown={(e) => {
            // Enter would otherwise submit the whole venue form.
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
            if (e.key === "Escape" && results) {
              e.stopPropagation();
              setResults(null);
            }
          }}
          placeholder="Search a place or landmark"
          aria-label="Search for the venue on the map"
          enterKeyHint="search"
        />
        {busy === "search" && (
          <CircleNotch
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald animate-spin"
          />
        )}
        {results && results.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 z-[1100] bg-paper-card border border-paper-line rounded-sm shadow-lg max-h-56 overflow-y-auto">
            {results.map((p) => {
              const [head, ...rest] = p.display_name.split(", ");
              return (
                <li key={`${p.lat},${p.lon}`}>
                  <button
                    type="button"
                    onClick={() => choose(p)}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-soft/50 border-b border-paper-line last:border-b-0"
                  >
                    <span className="block text-sm text-ink">{head}</span>
                    <span className="block text-xs text-ink-subtle truncate">{rest.join(", ")}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="relative h-60 border border-paper-line rounded-sm overflow-hidden bg-paper-card">
        <MapContainer
          center={initialCenter}
          zoom={value ? 16 : 5}
          scrollWheelZoom
          doubleClickZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapHandle mapRef={mapRef} />
          <TrackSize />
          <ViewController view={view} />
          <KeepPinInView value={value} />
          <ClickToPlace onPick={place} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pinFor(venueType)}
              draggable
              eventHandlers={{
                dragend(e) {
                  const p = (e.target as L.Marker).getLatLng();
                  place({ lat: p.lat, lng: p.lng });
                },
              }}
            />
          )}
        </MapContainer>

        <button
          type="button"
          onClick={locate}
          disabled={busy === "locate"}
          className="absolute top-2.5 right-2.5 z-[1000] grid place-items-center h-9 w-9 bg-paper-card border border-paper-line rounded-sm text-ink shadow-sm hover:border-emerald hover:text-emerald transition"
          title="Use my current location"
          aria-label="Use my current location"
        >
          {busy === "locate" ? (
            <CircleNotch size={18} className="animate-spin" />
          ) : (
            <Crosshair size={18} weight="bold" />
          )}
        </button>
        {!hasPin && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] whitespace-nowrap rounded-full bg-ink/80 px-3 py-1 text-xs text-paper">
            Tap to drop a pin
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          className="field-input font-mono text-xs py-2"
          value={lat}
          onChange={(e) => onChange(e.target.value, lng)}
          placeholder="Latitude"
          aria-label="Latitude"
          inputMode="decimal"
          required
        />
        <input
          className="field-input font-mono text-xs py-2"
          value={lng}
          onChange={(e) => onChange(lat, e.target.value)}
          placeholder="Longitude"
          aria-label="Longitude"
          inputMode="decimal"
          required
        />
      </div>
      {notice && <p className="text-xs text-plum">{notice}</p>}
    </div>
  );
}

/** The typed coordinates as a point, or null while blank or out of range. */
function parseLatLng(lat: string, lng: string): LatLng | null {
  if (!lat.trim() || !lng.trim()) return null;
  const p = { lat: Number(lat), lng: Number(lng) };
  if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return null;
  if (Math.abs(p.lat) > 90 || Math.abs(p.lng) > 180) return null;
  return p;
}
