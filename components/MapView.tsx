"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { NavigationArrow } from "@phosphor-icons/react";
import type { Eidgah, LatLng, Occasion, VenueType } from "@/lib/types";
import { gmapsUrl, timeForOccasion, timingLabel } from "@/lib/types";

const VENUE_LABEL: Record<VenueType, string> = {
  eidgah: "Eidgah",
  masjid: "Masjid",
  open_ground: "Open ground",
};

function pinFor(type: VenueType) {
  return L.divIcon({
    className: "",
    html: `<span class="eidgah-pin type-${type}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -16],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<span class="user-pin"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FitToMarkers({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13, { animate: false });
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

function RecenterControl({ userLoc }: { userLoc: LatLng }) {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => map.setView([userLoc.lat, userLoc.lng], 13)}
      className="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 bg-paper-card border border-paper-line rounded-sm px-3 h-9 text-sm text-ink shadow-sm hover:border-emerald transition"
      title="Center the map on your location"
    >
      <NavigationArrow size={16} weight="fill" /> My location
    </button>
  );
}

export default function MapView({
  eidgahs,
  occasion,
  userLoc,
}: {
  eidgahs: Eidgah[];
  occasion: Occasion;
  userLoc: LatLng | null;
}) {
  const center: [number, number] = useMemo(() => {
    if (userLoc) return [userLoc.lat, userLoc.lng];
    if (!eidgahs.length) return [20.5937, 78.9629];
    return [eidgahs[0].lat, eidgahs[0].lng];
  }, [eidgahs, userLoc]);

  const points = useMemo(
    () => eidgahs.map((e) => ({ lat: e.lat, lng: e.lng })),
    [eidgahs]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald" />
          Eidgah
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-plum" />
          Masjid
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-saffron" />
          Open ground
        </span>
        {userLoc && (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-sky-deep" />
            You
          </span>
        )}
      </div>
      <div className="relative h-[68vh] min-h-[480px] border border-paper-line rounded-sm overflow-hidden bg-paper-card">
        <MapContainer center={center} zoom={userLoc ? 12 : 5} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToMarkers points={points} />
          {userLoc && (
            <>
              <RecenterControl userLoc={userLoc} />
              <Circle
                center={[userLoc.lat, userLoc.lng]}
                radius={400}
                pathOptions={{ color: "#1f3d5c", fillColor: "#1f3d5c", fillOpacity: 0.12, weight: 1 }}
              />
              <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-sm text-ink">You are here</div>
                </Popup>
              </Marker>
            </>
          )}
          {eidgahs.map((e) => (
            <Marker key={e.id} position={[e.lat, e.lng]} icon={pinFor(e.venue_type)}>
              <Popup>
                <div className="space-y-1 min-w-[200px]">
                  <div className="text-[10px] uppercase tracking-widest text-saffron-deep font-semibold">
                    {VENUE_LABEL[e.venue_type]}
                  </div>
                  <div className="font-serif text-base leading-tight text-ink">
                    {e.name}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {e.area ? `${e.area}, ${e.city}` : e.city}
                  </div>
                  {(() => {
                    const t = timeForOccasion(e, occasion);
                    return t ? (
                      <div className="text-base font-semibold text-ink mt-1">
                        {timingLabel(occasion, t)}
                      </div>
                    ) : null;
                  })()}
                  {e.notes && (
                    <div className="text-xs text-ink-muted mt-1 leading-snug">
                      {e.notes}
                    </div>
                  )}
                  <a
                    className="inline-block mt-2 text-sm text-emerald font-medium hover:underline"
                    href={gmapsUrl(e, userLoc)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {userLoc ? "Directions" : "Open in Google Maps"} ↗
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
