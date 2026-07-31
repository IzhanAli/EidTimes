"use client";

import Link from "next/link";
import { CheckCircle, Clock, List as MenuIcon, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { Occasion } from "@/lib/types";
import { OCCASIONS } from "@/lib/types";

const GUIDES: Record<Occasion, {
  title: string;
  introduction: string;
  checklist: string[];
  timeline: { label: string; text: string }[];
}> = {
  eid_al_fitr: {
    title: "Eid al-Fitr Guide",
    introduction: "A simple guide for the morning that completes Ramadan and begins Shawwal with gratitude, prayer, and community.",
    checklist: [
      "Give Zakat al-Fitr before the Eid prayer.",
      "Perform ghusl, dress well, and use fragrance where appropriate.",
      "Eat an odd number of dates before leaving for prayer.",
      "Recite the takbeer and take a different route home when practical.",
    ],
    timeline: [
      { label: "Before leaving", text: "Prepare early, eat dates, and confirm the local prayer time." },
      { label: "At the prayer ground", text: "Arrive calmly, join the takbeer, and make space for others." },
      { label: "After prayer", text: "Listen to the khutbah, exchange greetings, and visit family and neighbours." },
    ],
  },
  eid_al_adha: {
    title: "Eid al-Adha Guide",
    introduction: "A practical guide for the day of sacrifice, remembrance, generosity, and the completion of the Hajj season.",
    checklist: [
      "Perform ghusl, dress well, and confirm the local prayer time.",
      "Delay eating until after the Eid prayer when following the common practice.",
      "Recite the takbeer from the prescribed days of Dhul Hijjah.",
      "Plan the udhiyah responsibly and distribute its meat with generosity.",
    ],
    timeline: [
      { label: "Before prayer", text: "Prepare early and continue the takbeer on the way to the prayer ground." },
      { label: "At the prayer ground", text: "Join the congregation, listen to the khutbah, and greet the community." },
      { label: "After prayer", text: "Complete the udhiyah after prayer and share with family, friends, and those in need." },
    ],
  },
};

export default function EidGuide({ initialOccasion }: { initialOccasion: Occasion }) {
  const [occasion, setOccasion] = useState<Occasion>(initialOccasion);
  const [menuOpen, setMenuOpen] = useState(false);
  const guide = GUIDES[occasion];

  useEffect(() => {
    document.documentElement.dataset.occasion = occasion;
  }, [occasion]);

  return (
    <>
      <header className="border-b border-paper-line bg-[#AAC3CA] sticky top-0 z-30">
        <div className="container-narrow py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link href="/" className="leading-tight shrink-0">
            <div className="font-serif text-lg text-ink">Eidgah Times</div>
            <div className="eyebrow brand-tagline hidden sm:block">Salat-ul-Eidain</div>
          </Link>

          <div role="tablist" aria-label="Choose Eid guide" className="inline-flex border border-paper-line rounded-sm overflow-hidden bg-paper-card h-9">
            {OCCASIONS.map((item, index) => {
              const active = occasion === item.value;
              return (
                <button
                  key={item.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setOccasion(item.value)}
                  className={`px-3 inline-flex items-center gap-1.5 text-sm ${index ? "border-l border-paper-line" : ""} ${active ? "bg-emerald text-paper" : "text-ink"}`}
                >
                  <img
                    src={item.value === "eid_al_fitr" ? "/thin-moon.png" : "/sheep.png?v=2"}
                    alt=""
                    className={`h-5 w-5 object-contain ${item.value === "eid_al_fitr" && occasion === "eid_al_adha" ? "brightness-0" : ""}`}
                  />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/" className="text-ink hover:text-emerald">Directory</Link>
            <Link href="/about" className="text-ink hover:text-emerald">About</Link>
          </nav>

          <div className="relative sm:hidden">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="h-9 w-9 grid place-items-center rounded-sm border border-ink/20" aria-label="Toggle navigation">
              {menuOpen ? <X size={21} /> : <MenuIcon size={22} />}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-md border border-paper-line bg-paper-card p-2 shadow-xl">
                <Link href="/" className="block px-3 py-2 text-sm text-ink">Directory</Link>
                <Link href="/about" className="block px-3 py-2 text-sm text-ink">About</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container-narrow py-12 sm:py-16">
        <section className="max-w-3xl">
          <div className="eyebrow mb-3">Prepare · Pray · Celebrate</div>
          <h1 className="font-serif text-4xl sm:text-6xl text-ink leading-tight">{guide.title}</h1>
          <p className="mt-5 text-lg text-ink-muted leading-relaxed">{guide.introduction}</p>
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section className="rounded-lg border border-paper-line bg-paper-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-deep">
              <CheckCircle size={24} weight="fill" />
              <h2 className="font-serif text-2xl">Eid checklist</h2>
            </div>
            <ul className="mt-6 space-y-4">
              {guide.checklist.map((item) => <li key={item} className="flex gap-3 text-ink-muted"><span className="text-emerald">✓</span><span>{item}</span></li>)}
            </ul>
          </section>

          <section className="rounded-lg border border-paper-line bg-paper-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-deep">
              <Clock size={24} weight="fill" />
              <h2 className="font-serif text-2xl">The morning timeline</h2>
            </div>
            <div className="mt-6 space-y-5">
              {guide.timeline.map((item) => (
                <div key={item.label} className="border-l-2 border-emerald pl-4">
                  <h3 className="font-semibold text-ink">{item.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <p className="mt-10 max-w-3xl text-sm text-ink-subtle">Local practices and scholarly guidance can vary. Confirm detailed rulings with a trusted local scholar.</p>
      </main>
    </>
  );
}
