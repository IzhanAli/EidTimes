"use client";

import { useEffect, useState } from "react";
import { MoonStars, Sparkle, MapPin } from "@phosphor-icons/react";
import type { Eidgah, VenueType } from "@/lib/types";
import { VENUE_TYPES } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (e: Eidgah) => void;
  onUpdated?: (e: Eidgah) => void;
  editing?: Eidgah | null;
  defaultCity?: string;
  defaultCountry?: string;
};

type FormState = {
  name: string;
  city: string;
  country: string;
  area: string;
  venue_type: VenueType;
  fitr_time: string; // "" = not held here
  adha_time: string;
  lat: string;
  lng: string;
  notes: string;
};

function blankForm(city = "", country = "IN"): FormState {
  return {
    name: "",
    city,
    country,
    area: "",
    venue_type: "eidgah",
    fitr_time: "07:00",
    adha_time: "07:00",
    lat: "",
    lng: "",
    notes: "",
  };
}

function formFromEntry(e: Eidgah): FormState {
  return {
    name: e.name,
    city: e.city,
    country: e.country,
    area: e.area ?? "",
    venue_type: e.venue_type,
    fitr_time: e.fitr_time ?? "",
    adha_time: e.adha_time ?? "",
    lat: String(e.lat),
    lng: String(e.lng),
    notes: e.notes ?? "",
  };
}

export default function AddEidgahDrawer({
  open,
  onClose,
  onCreated,
  onUpdated,
  editing = null,
  defaultCity = "",
  defaultCountry = "IN",
}: Props) {
  const isEditing = Boolean(editing);
  const [form, setForm] = useState<FormState>(blankForm(defaultCity, defaultCountry));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setForm(editing ? formFromEntry(editing) : blankForm(defaultCity, defaultCountry));
      setError(null);
    }
  }, [open, editing, defaultCity, defaultCountry]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("lat", pos.coords.latitude.toFixed(6));
        set("lng", pos.coords.longitude.toFixed(6));
      },
      (err) => setError(err.message || "Could not read your location.")
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.fitr_time && !form.adha_time) {
      setError("Provide a prayer time for at least one Eid.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        city: form.city,
        country: form.country,
        area: form.area,
        venue_type: form.venue_type,
        fitr_time: form.fitr_time || null,
        adha_time: form.adha_time || null,
        lat: Number(form.lat),
        lng: Number(form.lng),
        notes: form.notes,
      };
      const res = await fetch(
        isEditing ? `/api/eidgahs/${editing!.id}` : "/api/eidgahs",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not save.");
        return;
      }
      if (isEditing) onUpdated?.(json.data as Eidgah);
      else onCreated(json.data as Eidgah);
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-paper border-l border-paper-line shadow-2xl
        transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-paper-line bg-emerald-soft/40">
          <div>
            <div className="eyebrow">{isEditing ? "Edit" : "Contribute"}</div>
            <h2 className="font-serif text-xl mt-0.5 text-ink">
              {isEditing ? "Edit prayer venue" : "Add a prayer venue"}
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost h-8 px-2" aria-label="Close">
            Close
          </button>
        </div>

        <form
          onSubmit={submit}
          className="px-6 py-5 space-y-4 overflow-y-auto h-[calc(100%-77px)]"
        >
          <div>
            <label className="field-label block mb-1.5">Venue type</label>
            <div className="grid grid-cols-3 gap-2">
              {VENUE_TYPES.map((t) => {
                const active = form.venue_type === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => set("venue_type", t.value)}
                    className={`px-3 py-2 text-sm border rounded-sm transition
                      ${active
                        ? "bg-ink text-paper border-ink"
                        : "bg-paper-card text-ink border-paper-line hover:border-emerald"
                      }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-subtle mt-1">
              Many cities hold Eid salah at masjids or open grounds — pick what fits.
            </p>
          </div>

          <div>
            <label className="field-label block mb-1.5">
              {form.venue_type === "masjid"
                ? "Masjid name"
                : form.venue_type === "open_ground"
                  ? "Ground / location name"
                  : "Eidgah / Masjid name"}
            </label>
            <input
              className="field-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Shahi Eidgah · Mecca Masjid · Idgah Maidan"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label block mb-1.5">City</label>
              <input
                className="field-input"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Hyderabad"
                required
              />
            </div>
            <div>
              <label className="field-label block mb-1.5">Country</label>
              <select
                className="field-input"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                required
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label block mb-1.5">Area / locality</label>
            <input
              className="field-input"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="e.g. Bandra West · Charminar · Old City"
            />
            <p className="text-xs text-ink-subtle mt-1">
              Neighbourhood shown on the card to help people place it quickly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label block mb-1.5">Latitude</label>
              <input
                className="field-input font-mono"
                value={form.lat}
                onChange={(e) => set("lat", e.target.value)}
                placeholder="17.385000"
                inputMode="decimal"
                required
              />
            </div>
            <div>
              <label className="field-label block mb-1.5">Longitude</label>
              <input
                className="field-input font-mono"
                value={form.lng}
                onChange={(e) => set("lng", e.target.value)}
                placeholder="78.486700"
                inputMode="decimal"
                required
              />
            </div>
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="inline-flex items-center gap-1 text-xs text-emerald hover:underline"
          >
            <MapPin size={14} weight="fill" /> Use my current location
          </button>

          <div>
            <label className="field-label block mb-1.5">Eid prayer times</label>
            <p className="text-xs text-ink-subtle mb-2">
              Most venues hold both. Leave one blank if it isn&apos;t held here — at least
              one is required.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="flex items-center gap-1.5 text-sm text-emerald-deep mb-1">
                  <MoonStars size={16} weight="fill" /> Eid al-Fitr
                </span>
                <input
                  type="time"
                  className="field-input font-mono"
                  value={form.fitr_time}
                  onChange={(e) => set("fitr_time", e.target.value)}
                />
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-sm text-plum mb-1">
                  <Sparkle size={16} weight="fill" /> Eid al-Adha
                </span>
                <input
                  type="time"
                  className="field-input font-mono"
                  value={form.adha_time}
                  onChange={(e) => set("adha_time", e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-ink-subtle mt-1">
              Local time at the venue. 24-hour input, displayed in 12-hour format.
            </p>
          </div>

          <div>
            <label className="field-label block mb-1.5">Notes (optional)</label>
            <textarea
              className="field-input min-h-[88px] resize-y"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Entry gate, parking, women's section, organizer contact…"
            />
          </div>

          {error && (
            <div className="text-sm text-plum bg-plum-soft border border-plum/30 px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Submit entry"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
