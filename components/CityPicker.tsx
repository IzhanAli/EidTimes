"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import type { Eidgah } from "@/lib/types";
import { COUNTRIES, countryName } from "@/lib/countries";

type Props = {
  open: boolean;
  eidgahs: Eidgah[];
  detectedCountry: string | null;
  onPick: (selection: { city: string; country: string }) => void;
};

type CityOption = { city: string; count: number };

export default function CityPicker({ open, eidgahs, detectedCountry, onPick }: Props) {
  const [country, setCountry] = useState<string>(detectedCountry || "IN");
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (detectedCountry) setCountry(detectedCountry);
  }, [detectedCountry]);

  // Cities that already have entries in the data, with counts — these float to
  // the top of the list so populated cities are one tap away.
  const eidgahCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of eidgahs) {
      if (e.country === country) counts.set(e.city, (counts.get(e.city) ?? 0) + 1);
    }
    return counts;
  }, [eidgahs, country]);

  // Fetch the full city list for the country from the bundled dataset, debounced
  // on the search query. Cheap enough to re-run per keystroke server-side.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/cities?country=${encodeURIComponent(country)}&q=${encodeURIComponent(query)}`)
        .then((r) => (r.ok ? r.json() : { data: [] }))
        .then((j) => {
          if (!cancelled) setRemote(Array.isArray(j.data) ? j.data : []);
        })
        .catch(() => {
          if (!cancelled) setRemote([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, country, query]);

  const options: CityOption[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withEidgahs: CityOption[] = Array.from(eidgahCounts.entries())
      .filter(([city]) => !q || city.toLowerCase().includes(q))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([city, count]) => ({ city, count }));

    const seen = new Set(withEidgahs.map((c) => c.city.toLowerCase()));
    const rest: CityOption[] = remote
      .filter((city) => !seen.has(city.toLowerCase()))
      .map((city) => ({ city, count: 0 }));

    return [...withEidgahs, ...rest];
  }, [eidgahCounts, remote, query]);

  const trimmed = query.trim();
  const hasExact = options.some((o) => o.city.toLowerCase() === trimmed.toLowerCase());

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-paper w-full sm:max-w-lg rounded-t-xl sm:rounded-xl shadow-2xl border border-paper-line">
        <div className="rounded-t-xl bg-emerald-soft/40 border-b border-paper-line px-6 py-5">
          <div className="eyebrow">Welcome</div>
          <h2 className="font-serif text-2xl text-ink mt-1">Pick your city to begin</h2>
          <p className="text-sm text-ink-muted mt-1">
            We show eidgahs, masjids, and open grounds hosting Eid salah. Choose a city
            so the directory and map start where you do.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="sm:w-48">
              <label className="field-label block mb-1.5">Country</label>
              <select
                className="field-input h-11"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setQuery("");
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="field-label block mb-1.5">City</label>
              <div className="relative">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
                />
                <input
                  className="field-input h-11 pl-9"
                  placeholder={`Search cities in ${countryName(country)}…`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Searchable dropdown list */}
          <div className="border border-paper-line rounded-sm overflow-hidden">
            {loading && options.length === 0 ? (
              <div className="px-4 py-6 text-sm text-ink-subtle text-center">Loading cities…</div>
            ) : options.length === 0 ? (
              <div className="px-4 py-5 text-sm text-ink-muted text-center space-y-3">
                <p>No matching city in {countryName(country)}.</p>
                {trimmed && (
                  <button
                    onClick={() => onPick({ city: trimmed, country })}
                    className="inline-flex items-center gap-1.5 bg-emerald text-paper px-3 py-1.5 rounded-sm text-sm hover:bg-emerald-deep transition"
                  >
                    <MapPin size={15} weight="fill" /> Use “{trimmed}”
                  </button>
                )}
              </div>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y divide-paper-line/70">
                {!hasExact && trimmed && (
                  <li>
                    <button
                      onClick={() => onPick({ city: trimmed, country })}
                      className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-emerald-deep hover:bg-emerald-soft/50 transition"
                    >
                      <MapPin size={15} weight="fill" /> Use “{trimmed}”
                    </button>
                  </li>
                )}
                {options.map(({ city, count }) => (
                  <li key={city}>
                    <button
                      onClick={() => onPick({ city, country })}
                      className="w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 hover:bg-emerald-soft/50 transition"
                    >
                      <span className="text-sm text-ink truncate">{city}</span>
                      {count > 0 ? (
                        <span className="shrink-0 text-[11px] font-medium text-emerald-deep bg-emerald-soft rounded-full px-2 py-0.5">
                          {count} {count === 1 ? "listing" : "listings"}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] text-ink-subtle">Add first</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-ink-subtle text-right">
            You can change this later from the header.
          </p>

        </div>
      </div>
    </div>
  );
}
