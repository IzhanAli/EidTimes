"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { List as MenuIcon, MapPin, PencilSimple, Plus, X } from "@phosphor-icons/react";
import type { Eidgah, GeoStatus, LatLng, Occasion } from "@/lib/types";
import { OCCASIONS, hasOccasion, occasionLabel } from "@/lib/types";
import { countryName } from "@/lib/countries";
import ListView from "./ListView";
import AddEidgahDrawer from "./AddEidgahDrawer";
import CityPicker from "./CityPicker";
import {
  MosqueSkyline,
  StarDivider,
} from "./decor/EidMotifs";

// Editorial copy for the hero band, per occasion.
const OCCASION_HERO: Record<
  Occasion,
  { eyebrow: string; subtitle: string; line: string  }
> = {
  eid_al_fitr: {
    eyebrow: "1 Shawwal · The festival of breaking the fast", 
    subtitle: "After a Month of Fasting\nComes a Morning of Togetherness",
    line: "After a month of fasting, the community gathers at first light. Find where your city prays — and when.",
  },
  eid_al_adha: {
    eyebrow: "10 Dhul-Hijjah · The festival of sacrifice",
    subtitle: "After the blessed days of Dhul Hijjah\ncomes a morning of sacrifice",
    line: "In the days of pilgrimage, the takbeer calls out from every ground. Find where your city prays — and when.",
  },
};

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[68vh] min-h-[480px] border border-paper-line rounded-sm bg-paper-card grid place-items-center text-ink-muted text-sm">
      Loading map…
    </div>
  ),
});

type View = "list" | "map";
type Filter = { city: string; country: string };

const STORAGE_KEY = "eidgah:filter";

export default function Home({
  initial,
  detectedCountry,
  defaultOccasion,
}: {
  initial: Eidgah[];
  detectedCountry: string | null;
  defaultOccasion: Occasion;
}) {
  const [view, setView] = useState<View>("list");
  const [eidgahs, setEidgahs] = useState<Eidgah[]>(initial);
  // Which Eid is shown. Defaults to the DB-controlled occasion; the navbar
  // toggle overrides it for the session.
  const [occasion, setOccasion] = useState<Occasion>(defaultOccasion);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Eidgah | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Filter | null>(null);
  const [clientCountry, setClientCountry] = useState<string | null>(detectedCountry);
  const [userLoc, setUserLoc] = useState<LatLng | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoError, setGeoError] = useState<string | null>(null);
  // If SSR came back empty (e.g. a cold database on the first request), we're
  // still loading until the client refetch lands — distinguishes "loading" from
  // a genuinely empty city so the list isn't misreported as absent.
  const [loaded, setLoaded] = useState(initial.length > 0);

  // The occasion picks the page-wide theme: emerald/gold for Eid al-Fitr,
  // terracotta/amber for Eid al-Adha (variable blocks in globals.css).
  useEffect(() => {
    document.documentElement.dataset.occasion = occasion;
  }, [occasion]);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("Location isn't supported on this device.");
      return;
    }
    setGeoStatus("locating");
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("ok");
      },
      (err) => {
        setGeoStatus("error");
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can enable it in your browser settings."
            : "Couldn't get your location. Try again."
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  // Restore filter from localStorage, otherwise open picker on first visit.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Filter;
        // Require a specific city — older saved "all cities" filters re-prompt.
        if (parsed && typeof parsed.country === "string" && parsed.city) {
          setFilter(parsed);
          return;
        }
      }
    } catch {}
    setPickerOpen(true);
  }, []);

  // If server-side detection didn't get a country, ask api.country.is (free, CORS-enabled).
  useEffect(() => {
    if (detectedCountry) return;
    let cancelled = false;
    fetch("https://api.country.is/")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j?.country) return;
        setClientCountry(String(j.country).toUpperCase());
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [detectedCountry]);

  // Pull the latest list from the API. Used on mount (so a cold-DB SSR that
  // returned nothing still fills in promptly) and whenever the tab regains focus.
  const refresh = useCallback(() => {
    return fetch("/api/eidgahs")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j.data)) setEidgahs(j.data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  function commitFilter(next: Filter) {
    setFilter(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setPickerOpen(false);
  }

  function handleCreated(e: Eidgah) {
    setEidgahs((prev) => [e, ...prev]);
  }

  function handleUpdated(e: Eidgah) {
    setEidgahs((prev) => prev.map((x) => (x.id === e.id ? e : x)));
  }

  function openAdd() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(e: Eidgah) {
    setEditing(e);
    setDrawerOpen(true);
  }

  const visible = useMemo(() => {
    // Only one Eid is shown at a time, then narrowed by the chosen city.
    const byOccasion = eidgahs.filter((e) => hasOccasion(e, occasion));
    if (!filter) return byOccasion;
    return byOccasion.filter(
      (e) =>
        e.country === filter.country &&
        (filter.city ? e.city === filter.city : true)
    );
  }, [eidgahs, filter, occasion]);

  return (
    <>
      <header className="border-b border-paper-line bg-[#AAC3CA] sticky top-0 z-30">
        <div className="container-narrow navbar-shell py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="leading-tight">
                <div className="font-serif text-lg text-ink whitespace-nowrap">Eidgah Times</div>
                <div className="eyebrow brand-tagline hidden sm:block">Salat-ul-Eidain</div>
              </div>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <Link href="/about" className="hidden lg:inline text-ink-muted hover:text-ink transition">
                About
              </Link>
            </nav>
          </div>

          <div
            role="tablist"
            aria-label="Occasion"
            className="navbar-occasion-toggle inline-flex border border-paper-line rounded-sm overflow-hidden bg-paper-card h-9 shrink-0"
          >
            {OCCASIONS.map((o, i) => {
              const active = occasion === o.value;
              return (
                <button
                  key={o.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setOccasion(o.value)}
                  title={`Show ${o.label} eidgahs`}
                  className={`px-3 inline-flex items-center gap-1.5 text-sm transition ${
                    i > 0 ? "border-l border-paper-line" : ""
                  } ${active ? "bg-emerald text-paper" : "text-ink hover:bg-emerald-soft"}`}
                >
                  <span
                    key={`${o.value}-${active}`}
                    className={`inline-flex ${active ? "animate-pop" : ""}`}
                  >
                    {o.value === "eid_al_adha" ? (
                      <img src="/sheep.png?v=2" alt="" className="h-5 w-5 object-contain" />
                    ) : (
                      <img
                        src="/thin-moon.png"
                        alt=""
                        className={`h-5 w-5 object-contain ${
                          occasion === "eid_al_adha" ? "brightness-0" : ""
                        }`}
                      />
                    )}
                  </span>
                  <span className="hidden md:inline">{o.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {filter && (
              <button
                onClick={() => setPickerOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-paper-card border border-paper-line px-3 h-9 rounded-sm text-sm hover:border-emerald transition"
                title="Change city"
              >
                <MapPin size={18} weight="regular" className="text-ink shrink-0" />
                <span className="text-ink-subtle text-xs uppercase tracking-widest">
                  {countryName(filter.country)}
                </span>
                <span className="text-ink font-medium">{filter.city}</span>
                <PencilSimple size={16} weight="regular" className="text-ink shrink-0" />
              </button>
            )}
            <button
              className="btn btn-add inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              onClick={openAdd}
            >
              <Plus size={16} weight="bold" className="btn-add-icon" />
              Add Venue<span className="hidden sm:inline">&nbsp;</span>
            </button>
            <button
              type="button"
              className="sm:hidden h-9 w-9 grid place-items-center rounded-sm border border-ink/20 text-ink"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={21} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full right-3 mt-2 w-40 rounded-md border border-paper-line bg-paper-card p-2 shadow-xl">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-sm px-3 py-2 text-sm font-medium text-ink hover:bg-emerald-soft/60"
            >
              Directory
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-sm px-3 py-2 text-sm font-medium text-ink hover:bg-emerald-soft/60"
            >
              About
            </Link>
          </div>
        )}
      </header>

      {/* Occasion hero — deep themed band with the animated scene for the
          active Eid. Keyed by occasion so switching replays the entrance. */}
      <section className="hero-band" aria-label={`${occasionLabel(occasion)} — currently showing`}>
        <div className="hero-image-overlay" aria-hidden />
        <div className="container-narrow relative z-10 py-14 sm:py-14 flex items-center justify-between gap-10">
          <div
            key={occasion}
            className={`animate-fade-up w-4/5 min-w-0 sm:w-full ${
              occasion === "eid_al_adha" ? "max-w-4xl" : "max-w-3xl"
            }`}
          >
            <h1 className={`hero-title mt-3 ${occasion === "eid_al_adha" ? "hero-title-adha" : ""}`}>
              {occasionLabel(occasion)}{" "}
            </h1>

            <p className="hero-subtitle mt-6 text-2xl sm:text-4xl text-black leading-snug max-w-3xl font-regular-italic drop-shadow-[2px_3px_3px_rgba(0,0,0,0.35)]">
              {OCCASION_HERO[occasion].subtitle.split("\n").map((text) => (
                <span className="block" key={text}>{text}</span>
              ))}
            </p>

            <p className="mt-4 text-sm sm:text-base leading-relaxed max-w-md ">
              {OCCASION_HERO[occasion].line}
            </p>

          </div>
        </div>
        <button
          type="button"
          className="hero-search-button"
          onClick={() => document.querySelector("main")?.scrollIntoView({ behavior: "smooth" })}
          aria-label="Search Eid prayer locations"
        >
          <span className="hero-search-icon" aria-hidden>
            <img src="/loupe.png" alt="" className="h-14 w-14 object-contain" />
          </span>
          <span className="hero-search-hint" text-light text-sm>
            Click here
          </span>
        </button>
      </section>

      <main className="container-narrow py-10">
        {/* Mobile-only city control — the header chip is hidden below sm, so
            without this there'd be no way to change city on a phone. */}
        {filter && (
          <button
            onClick={() => setPickerOpen(true)}
            className="sm:hidden w-full flex items-center justify-between gap-2 bg-paper-card border border-paper-line px-3 h-11 rounded-sm text-sm mb-5 hover:border-emerald transition"
            title="Change city"
          >
            <span className="flex items-center gap-2 min-w-0">
              <MapPin size={16} weight="fill" className="text-emerald shrink-0" />
              <span className="text-ink-subtle text-xs uppercase tracking-widest shrink-0">
                {countryName(filter.country)}
              </span>
              <span className="text-ink font-medium truncate">{filter.city}</span>
            </span>
            <span className="text-emerald shrink-0">Change</span>
          </button>
        )}

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div
            role="tablist"
            aria-label="View"
            className="inline-flex border border-paper-line rounded-sm overflow-hidden bg-paper-card"
          >
            <button
              role="tab"
              aria-selected={view === "list"}
              onClick={() => setView("list")}
              className={`px-4 h-9 text-sm transition ${
                view === "list" ? "bg-emerald text-paper" : "text-ink hover:bg-emerald-soft"
              }`}
            >
              City list
            </button>
            <button
              role="tab"
              aria-selected={view === "map"}
              onClick={() => setView("map")}
              className={`px-4 h-9 text-sm border-l border-paper-line transition ${
                view === "map" ? "bg-emerald text-paper" : "text-ink hover:bg-emerald-soft"
              }`}
            >
              Map
            </button>
          </div>
          <div className="text-xs text-ink-subtle">
            Open data · Submitted by visitors
          </div>
        </div>

        {view === "list" ? (
          <ListView
            eidgahs={visible}
            occasion={occasion}
            userLoc={userLoc}
            geoStatus={geoStatus}
            geoError={geoError}
            onRequestLocation={requestLocation}
            onEdit={openEdit}
            onAdd={openAdd}
            emptyCity={filter?.city}
            loading={!loaded}
            showMapPreviews={!!filter?.city}
          />
        ) : (
          <MapView eidgahs={visible} occasion={occasion} userLoc={userLoc} />
        )}
      </main>

      <div className="mt-16">
        {/* skyline bleeds into the footer block below it */}
        <MosqueSkyline className="block w-full h-auto text-emerald-deep translate-y-px transition-colors" />
        <footer className="bg-emerald-deep text-paper/80 transition-colors">
          <div className="container-narrow py-10">
            <StarDivider className="text-paper/70 mb-8" />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm">
              <div>
                <span className="font-serif text-paper">Eidgah Times</span> — crowd-verified
                prayer times. Confirm locally before travelling.
              </div>
              <div className="text-xs text-paper/55">
                Map tiles © OpenStreetMap contributors.
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AddEidgahDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        editing={editing}
        defaultCity={filter?.city ?? ""}
        defaultCountry={filter?.country ?? clientCountry ?? "IN"}
      />

      <CityPicker
        open={pickerOpen}
        eidgahs={eidgahs}
        detectedCountry={clientCountry}
        onPick={commitFilter}
      />
    </>
  );
}
