"use client";

import { useEffect, useMemo, useState } from "react";
import type { Eidgah } from "@/lib/types";
import { COUNTRIES, countryName } from "@/lib/countries";

type Props = {
  open: boolean;
  eidgahs: Eidgah[];
  detectedCountry: string | null;
  onPick: (selection: { city: string; country: string }) => void;
};

export default function CityPicker({ open, eidgahs, detectedCountry, onPick }: Props) {
  const [country, setCountry] = useState<string>(detectedCountry || "IN");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (detectedCountry) setCountry(detectedCountry);
  }, [detectedCountry]);

  // Cities present in the data for the selected country, with counts
  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of eidgahs) {
      if (e.country === country) counts.set(e.city, (counts.get(e.city) ?? 0) + 1);
    }
    const arr = Array.from(counts.entries()).map(([city, count]) => ({ city, count }));
    arr.sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
    return arr;
  }, [eidgahs, country]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.city.toLowerCase().includes(q));
  }, [cities, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-paper w-full sm:max-w-2xl border border-paper-line rounded-sm shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-paper-line bg-emerald-soft/40">
          <div className="eyebrow">Welcome</div>
          <h2 className="font-serif text-2xl text-ink mt-1">Pick your city to begin</h2>
          <p className="text-sm text-ink-muted mt-1 max-w-prose">
            We show eidgahs, masjids, and open grounds hosting Eid salah. Choose a city
            so the directory and map start where you do.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="field-label block mb-1.5">Country</label>
              <select
                className="field-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {detectedCountry && (
                <p className="text-xs text-ink-subtle mt-1">
                  Detected: <span className="text-emerald">{countryName(detectedCountry)}</span>
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="field-label block mb-1.5">Search city</label>
              <input
                className="field-input"
                placeholder="Type a city name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="eyebrow-muted mb-2">
              Cities in {countryName(country)} · {cities.length}
            </div>
            {filtered.length === 0 ? (
              <div className="border border-dashed border-paper-line rounded-sm p-6 text-sm text-ink-muted">
                No cities listed here yet. Pick another country, or add the first entry.
              </div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {filtered.map(({ city, count }) => (
                  <li key={city}>
                    <button
                      onClick={() => onPick({ city, country })}
                      className="w-full text-left bg-paper-card border border-paper-line px-3 py-2 rounded-sm hover:border-emerald hover:bg-emerald-soft/40 transition"
                    >
                      <div className="text-sm text-ink leading-tight">{city}</div>
                      <div className="text-[11px] text-ink-subtle mt-0.5">
                        {count} {count === 1 ? "entry" : "entries"}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-paper-line">
            <span className="text-xs text-ink-subtle">
              You can change this later from the header.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
