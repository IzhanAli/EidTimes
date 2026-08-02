import Link from "next/link";
import { listEidgahs } from "@/lib/db";
import type { Eidgah } from "@/lib/types";
import AboutMobileMenu from "@/components/AboutMobileMenu";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About — Eidgah Times",
  description:
    "What Eidgah Times is: crowd-verified Eid prayer locations and times.",
};

export default async function AboutPage() {
  let all: Eidgah[] = [];
  try {
    all = await listEidgahs();
  } catch {
    all = [];
  }
  const cityCount = new Set(all.map((e) => e.city)).size;
  const countryCount = new Set(all.map((e) => e.country)).size;
  const lastAdded = all.reduce<string | null>(
    (latest, e) => (!latest || e.created_at > latest ? e.created_at : latest),
    null
  );
  const lastAddedLabel = lastAdded
    ? new Date(lastAdded).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <header className="border-b border-paper-line bg-[#AAC3CA] sticky top-0 z-30">
        <div className="container-narrow navbar-shell py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1 sm:gap-2">
              <img
                src="/eidtimes.svg"
                alt="Eidgah Times logo"
                className="h-8 w-8 shrink-0 rounded-lg object-cover mix-blend-multiply sm:h-10 sm:w-10"
              />
              <div className="leading-tight">
                <div className="font-serif text-[15px] text-ink sm:text-lg">Eidgah Times</div>
                <div className="eyebrow brand-tagline">Salat-ul-Eidain</div>
              </div>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/about" className="text-ink font-medium border-b-2 border-emerald pb-0.5">
                About
              </Link>
              <Link href="/guide" className="text-ink hover:text-emerald transition">
                Eid Guide
              </Link>
            </nav>
          </div>
          <Link href="/" className="btn btn-primary hidden sm:inline-flex">
            Browse directory
          </Link>
          <AboutMobileMenu />
        </div>
      </header>

      <main className="container-narrow py-12">
        <section className="max-w-prose">
          <div className="eyebrow mb-3">Vol. I · Open contributions</div>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tightish leading-[1.05] text-ink">
            Eid prayer locations and times,
            <br />
            <span className="text-emerald-deep">kept by the community.</span>
          </h1>
          <p className="mt-4 text-ink-muted leading-relaxed">
            A directory of <span className="text-emerald-deep font-medium">eidgahs</span>,{" "}
            <span className="text-plum font-medium">masjids hosting Eid salah</span>, and{" "}
            <span className="text-saffron-deep font-medium">open grounds</span> — searchable
            by city and viewable on a map. Anyone can add an entry.
          </p>
          <p className="mt-4 text-ink-muted leading-relaxed">
            Eidgah locations are submitted by visitors and shown as-is. Timings and locations can
            change year to year, so always verify locally before travelling.
          </p>
        </section>

        <section className="mt-10 pt-8 border-t border-paper-line">
          <div className="eyebrow mb-4">At a glance</div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl">
            <div>
              <dd className="font-serif text-3xl text-emerald-deep">{all.length}</dd>
              <dt className="text-ink-muted text-sm mt-1">Eidgahs</dt>
            </div>
            <div>
              <dd className="font-serif text-3xl text-plum">{cityCount}</dd>
              <dt className="text-ink-muted text-sm mt-1">Cities</dt>
            </div>
            <div>
              <dd className="font-serif text-3xl text-saffron-deep">{countryCount}</dd>
              <dt className="text-ink-muted text-sm mt-1">Countries</dt>
            </div>
            <div>
              <dd className="font-serif text-xl text-ink pt-2">{lastAddedLabel}</dd>
              <dt className="text-ink-muted text-sm mt-1">Last added</dt>
            </div>
          </dl>
        </section>

        <div className="mt-12">
          <Link href="/" className="text-emerald hover:underline">
            ← Back to the directory
          </Link>
        </div>
      </main>

      <footer className="border-t border-paper-line mt-16 bg-emerald-soft/30">
        <div className="container-narrow py-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-ink-muted">
          <div>
            <span className="font-serif text-emerald-deep">Eidgah Times</span> — crowd-verified
            prayer times. Confirm locally before travelling.
          </div>
          <div className="text-xs text-ink-subtle">
            Map tiles © OpenStreetMap contributors.
          </div>
        </div>
      </footer>
    </>
  );
}
