import Link from "next/link";
import { listEidgahs } from "@/lib/db";
import type { Eidgah } from "@/lib/types";
import AboutMobileMenu from "@/components/AboutMobileMenu";
import SiteFooter from "@/components/SiteFooter";

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
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-emerald hover:underline">
          <span aria-hidden>←</span>
          Back
        </Link>

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

        <section className="mt-10 pt-8" aria-labelledby="about-stats-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Community directory</div>
              <h2 id="about-stats-title" className="mt-1 font-serif text-2xl text-ink">
                At a glance
              </h2>
            </div>
            <span className="hidden sm:block text-xs text-ink-muted">Updated as the community grows</span>
          </div>

          <dl className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { value: all.length, label: "Eidgahs", detail: "Prayer places", accent: "bg-emerald", valueClass: "text-emerald-deep" },
              { value: cityCount, label: "Cities", detail: "Across the directory", accent: "bg-plum", valueClass: "text-plum" },
              { value: countryCount, label: "Countries", detail: "Community coverage", accent: "bg-saffron", valueClass: "text-saffron-deep" },
              { value: lastAddedLabel, label: "Last added", detail: "Latest contribution", accent: "bg-[#2C7285]", valueClass: "text-ink" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group relative min-h-36 overflow-hidden rounded-xl border border-paper-line bg-white/55 p-4 shadow-[0_10px_30px_rgba(44,114,133,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(44,114,133,0.14)] sm:p-5"
              >
                <span className={`absolute inset-x-0 top-0 h-1 ${stat.accent}`} aria-hidden />
                <span className={`mb-5 block h-2.5 w-2.5 rounded-full ${stat.accent} ring-4 ring-white/80`} aria-hidden />
                <dd className={`font-serif leading-none ${stat.valueClass} ${stat.label === "Last added" ? "text-xl" : "text-4xl"}`}>
                  {stat.value}
                </dd>
                <dt className="mt-2 text-sm font-semibold text-ink">{stat.label}</dt>
                <p className="mt-1 text-[11px] leading-snug text-ink-muted">{stat.detail}</p>
              </div>
            ))}
          </dl>
        </section>

      </main>

      <SiteFooter />
    </>
  );
}
