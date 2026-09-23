"use client";

import Link from "next/link";
import { CheckCircle, Clock } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { Occasion } from "@/lib/types";
import { OCCASIONS } from "@/lib/types";
import MobileNavigation from "./MobileNavigation";
import SiteFooter from "./SiteFooter";

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

const FITR_STEPS = [
  {
    icon: "🌙",
    period: "After Sunset (Eid Night)",
    title: "Recite Takbeer",
    body: "Begin reciting Takbeer from sunset on the night before Eid until the Eid prayer.",
    quote: "Allahu Akbar, Allahu Akbar, La ilaha illallah. Allahu Akbar, Allahu Akbar, wa lillahil hamd.",
    reference: "Qur'an 2:185",
    href: "https://quran.com/2/185",
  },
  {
    icon: "🤲",
    period: "Pay Zakat al-Fitr",
    title: "Obligatory Before Prayer",
    body: "Zakat al-Fitr must be given before the Eid prayer so that those in need can also celebrate Eid.",
    quote: "The Messenger of Allah obligated Zakat al-Fitr...",
    reference: "Sahih al-Bukhari 1503 · Sahih Muslim 984",
    href: "https://sunnah.com/bukhari:1503",
  },
  {
    icon: "🌅",
    period: "Before Leaving Home",
    title: "Eat Before Going",
    body: "It is Sunnah on Eid al-Fitr to eat an odd number of dates before leaving for the Eid prayer.",
    reference: "Sahih al-Bukhari 953",
    href: "https://sunnah.com/bukhari:953",
  },
  {
    icon: "🕌",
    period: "Go for the Eid Prayer",
    title: "Join the Congregation",
    body: "Attend the Eid prayer at the Eidgah or mosque. Continue reciting Takbeer while going.",
    reference: "Read the Eid prayer guide",
    href: "https://sunnah.com/bukhari/13",
  },
  {
    icon: "📖",
    period: "Listen to the Khutbah",
    title: "Remain After Prayer",
    body: "After completing the Eid prayer, remain and listen to the khutbah. Although listening is not a condition for the validity of the prayer, it is the practice of the Prophet ﷺ and is highly recommended.",
    reference: "Sahih al-Bukhari · Sahih Muslim",
    href: "https://sunnah.com/bukhari/13",
  },
  {
    icon: "🤝",
    period: "Greet One Another",
    title: "Share the Eid Greeting",
    body: "Say: Taqabbalallahu minna wa minkum — May Allah accept from us and from you. This was the practice of the Companions.",
    reference: "Read more about Eid greetings",
    href: "https://islamqa.info/en/answers/49021",
  },
  {
    icon: "🛣️",
    period: "Return by a Different Route",
    title: "A Sunnah of Eid",
    body: "The Prophet ﷺ would return home by a different route after the Eid prayer.",
    reference: "Sahih al-Bukhari 986",
    href: "https://sunnah.com/bukhari:986",
  },
] as const;

export default function EidGuide({ initialOccasion }: { initialOccasion: Occasion }) {
  const [occasion, setOccasion] = useState<Occasion>(initialOccasion);
  const journeyRef = useRef<HTMLDivElement>(null);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const guide = GUIDES[occasion];

  useEffect(() => {
    document.documentElement.dataset.occasion = occasion;
  }, [occasion]);

  useEffect(() => {
    if (occasion !== "eid_al_fitr") return;
    const updateProgress = () => {
      const journey = journeyRef.current;
      if (!journey) return;
      const rect = journey.getBoundingClientRect();
      const viewportMarker = window.innerHeight * 0.55;
      const progress = (viewportMarker - rect.top) / Math.max(rect.height, 1);
      setJourneyProgress(Math.min(1, Math.max(0, progress)));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [occasion]);

  return (
    <>
      <header className="border-b border-paper-line bg-[#AAC3CA] sticky top-0 z-30">
        <div className="container-narrow py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
            <img
              src="/eidtimes.svg"
              alt="Eidgah Times logo"
              className="h-8 w-8 shrink-0 rounded-lg object-cover mix-blend-multiply sm:h-10 sm:w-10"
            />
            <div className="leading-tight">
              <div className="font-serif text-[15px] text-ink whitespace-nowrap sm:text-lg">Eidgah Times</div>
              <div className="eyebrow brand-tagline hidden sm:block">Salat-ul-Eidain</div>
            </div>
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
            <Link href="/guide" className="text-ink font-medium border-b-2 border-emerald pb-0.5">Eid Guide</Link>
          </nav>

          <MobileNavigation />
        </div>
      </header>

      <main className="container-narrow py-12 sm:py-16">
        <section className="max-w-3xl">
          <div className="eyebrow mb-3">Prepare · Pray · Celebrate</div>
          <h1 className="font-serif text-4xl sm:text-6xl text-ink leading-tight">{guide.title}</h1>
          <p className="mt-5 text-lg text-ink-muted leading-relaxed">{guide.introduction}</p>
        </section>

        {occasion === "eid_al_fitr" ? (
          <div ref={journeyRef} className="fitr-journey mt-14">
            <div className="fitr-journey-track" aria-hidden>
              <div
                className="fitr-journey-progress"
                style={{ transform: `scaleY(${journeyProgress})` }}
              />
            </div>
            <div className="space-y-14 sm:space-y-20">
              {FITR_STEPS.map((step) => (
                <article className="fitr-step" key={step.period}>
                  <div className="fitr-step-visual" aria-hidden>
                    <span>{step.icon}</span>
                  </div>
                  <div className="fitr-step-content">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                      {step.period}
                    </p>
                    <h2 className="mt-2 font-serif text-base text-ink">{step.title}</h2>
                    <p className="mt-4 max-w-2xl text-xs leading-5 text-ink-muted">{step.body}</p>
                    {"quote" in step && step.quote ? (
                      <blockquote className="mt-4 max-w-2xl border-l-2 border-emerald/50 pl-4 font-serif text-xs italic leading-5 text-ink">
                        “{step.quote}”
                      </blockquote>
                    ) : null}
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-deep underline decoration-emerald/35 underline-offset-4 transition hover:text-emerald"
                    >
                      Reference: {step.reference}
                      <span aria-hidden>↗</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
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
        )}

      </main>
      <SiteFooter />
    </>
  );
}
