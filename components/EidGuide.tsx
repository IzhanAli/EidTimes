"use client";

import Link from "next/link";
import { BookOpen } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { Occasion } from "@/lib/types";
import { OCCASIONS } from "@/lib/types";
import MobileNavigation from "./MobileNavigation";
import SiteFooter from "./SiteFooter";
import AddVenueNavigationAction from "./AddVenueNavigationAction";

const GUIDES: Record<Occasion, {
  title: string;
  introduction: string;
}> = {
  eid_al_fitr: {
    title: "Eid Al-Fitr Guide",
    introduction: "A simple guide for the morning that completes Ramadan and begins Shawwal with gratitude, prayer, and community.",
  },
  eid_al_adha: {
    title: "Eid Al-Adha Guide",
    introduction: "A practical guide for the day of sacrifice, remembrance, generosity, and the completion of the Hajj season.",
  },
};

type GuideStep = {
  title: string;
  body: string;
  reference: string;
  href: string;
};

const GUIDE_STEPS: Record<Occasion, GuideStep[]> = {
  eid_al_fitr: [
    {
      title: "Recite Takbeer",
      body: "Begin reciting Takbeer from sunset on the night before Eid until the Eid prayer.",
      reference: "Qur'an 2:185",
      href: "https://quran.com/2/185",
    },
    {
      title: "Pay Zakat al-Fitr",
      body: "Zakat al-Fitr must be given before the Eid prayer so that those in need can also celebrate Eid.",
      reference: "Sahih al-Bukhari 1503 · Sahih Muslim 984",
      href: "https://sunnah.com/bukhari:1503",
    },
    {
      title: "Eat Dates",
      body: "It is Sunnah on Eid al-Fitr to eat an odd number of dates before leaving for the Eid prayer.",
      reference: "Sahih al-Bukhari 953",
      href: "https://sunnah.com/bukhari:953",
    },
    {
      title: "Join the Congregation",
      body: "Attend the Eid prayer at the Eidgah or mosque. Continue reciting Takbeer while going.",
      reference: "Read the Eid prayer guide",
      href: "https://sunnah.com/bukhari/13",
    },
    {
      title: "Listen to the Khutbah",
      body: "After completing the Eid prayer, remain and listen to the khutbah. Although listening is not a condition for the validity of the prayer, it is the practice of the Prophet ﷺ and is highly recommended.",
      reference: "Sahih al-Bukhari · Sahih Muslim",
      href: "https://sunnah.com/bukhari/13",
    },
    {
      title: "Share the Eid Greeting",
      body: "Say: Taqabbalallahu minna wa minkum — May Allah accept from us and from you. This was the practice of the Companions.",
      reference: "Read more about Eid greetings",
      href: "https://islamqa.info/en/answers/49021",
    },
    {
      title: "Return by a Different Route",
      body: "The Prophet ﷺ would return home by a different route after the Eid prayer.",
      reference: "Sahih al-Bukhari 986",
      href: "https://sunnah.com/bukhari:986",
    },
  ],
  eid_al_adha: [
    {
      title: "Recite Takbeer",
      body: "Remember Allah and recite Takbeer during the days of Dhul Hijjah and Eid. Follow your local imam for guidance on the exact times.",
      reference: "Sahih al-Bukhari 969",
      href: "https://sunnah.com/bukhari:969",
    },
    {
      title: "Prepare for Eid Prayer",
      body: "Confirm your local Eid prayer time and venue, then prepare to join the congregation.",
      reference: "Local Eid prayer listings",
      href: "/",
    },
    {
      title: "Wait Until After Prayer to Eat",
      body: "It is recommended to wait until after the Eid prayer before eating. If offering udhiyah, the Prophet ﷺ would eat from it.",
      reference: "Jami` at-Tirmidhi 542",
      href: "https://sunnah.com/tirmidhi:542",
    },
    {
      title: "Join the Congregation",
      body: "Attend the Eid prayer at the Eidgah or mosque, and join the community in prayer and remembrance.",
      reference: "Sahih al-Bukhari 956",
      href: "https://sunnah.com/bukhari:956",
    },
    {
      title: "Listen to the Khutbah",
      body: "Remain after the prayer to listen to the khutbah and benefit from its reminder.",
      reference: "Sahih al-Bukhari 956",
      href: "https://sunnah.com/bukhari:956",
    },
    {
      title: "Offer Udhiyah After Prayer",
      body: "If offering udhiyah, perform it after the Eid prayer. Share its meat with your household, relatives, and those in need.",
      reference: "Sahih al-Bukhari 5545",
      href: "https://sunnah.com/bukhari:5545",
    },
    {
      title: "Share the Eid Greeting",
      body: "Exchange warm Eid greetings and make dua for one another as you celebrate with family and community.",
      reference: "Read more about Eid greetings",
      href: "https://islamqa.info/en/answers/49021",
    },
    {
      title: "Return by a Different Route",
      body: "The Prophet ﷺ would return home by a different route after the Eid prayer.",
      reference: "Sahih al-Bukhari 986",
      href: "https://sunnah.com/bukhari:986",
    },
  ],
};

export default function EidGuide({ initialOccasion }: { initialOccasion: Occasion }) {
  const [occasion, setOccasion] = useState<Occasion>(initialOccasion);
  const journeyRef = useRef<HTMLDivElement>(null);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const guide = GUIDES[occasion];
  const steps = GUIDE_STEPS[occasion];

  useEffect(() => {
    document.documentElement.dataset.occasion = occasion;
  }, [occasion]);

  useEffect(() => {
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
        <div className="container-narrow navbar-shell py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-1 sm:gap-2 min-w-0">
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
            <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <Link href="/about" className="hidden lg:inline text-ink-muted hover:text-ink transition">
                About
              </Link>
              <Link href="/guide" className="hidden lg:inline text-ink font-medium border-b-2 border-emerald pb-0.5">
                Eid Guide
              </Link>
            </nav>
          </div>

          <div
            role="tablist"
            aria-label="Occasion"
            className="navbar-occasion-toggle inline-flex border border-paper-line rounded-sm overflow-hidden bg-paper-card h-8 sm:h-9 shrink-0"
          >
            {OCCASIONS.map((item, index) => {
              const active = occasion === item.value;
              return (
                <button
                  key={item.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setOccasion(item.value)}
                  title={`Show ${item.label} guide`}
                  className={`px-2 sm:px-3 inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition ${
                    index > 0 ? "border-l border-paper-line" : ""
                  } ${active ? "bg-emerald text-paper" : "text-ink hover:bg-emerald-soft"}`}
                >
                  <span key={`${item.value}-${active}`} className={`inline-flex ${active ? "animate-pop" : ""}`}>
                    {item.value === "eid_al_adha" ? (
                      <img src="/sheep.png?v=2" alt="" className="h-4 w-4 object-contain sm:h-5 sm:w-5" />
                    ) : (
                      <img
                        src="/thin-moon.png"
                        alt=""
                        className={`h-4 w-4 object-contain sm:h-5 sm:w-5 ${
                          occasion === "eid_al_adha" ? "brightness-0" : ""
                        }`}
                      />
                    )}
                  </span>
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <AddVenueNavigationAction />
            <MobileNavigation buttonClassName="h-8 w-8" />
          </div>
        </div>
      </header>

      <main className="container-narrow py-12 sm:py-16">
        <section className="max-w-3xl">
          <h1 className="guide-title">{guide.title}</h1>
          <p className="guide-introduction">
            {guide.introduction}
          </p>
        </section>

        <div ref={journeyRef} className="guide-journey mt-14">
          <div className="guide-journey-track" aria-hidden>
            <div
              className="guide-journey-progress"
              style={{ transform: `scaleY(${journeyProgress})` }}
            />
          </div>
          <div className="space-y-14 sm:space-y-20">
            {steps.map((step, index) => (
              <article className="guide-step" key={step.title}>
                <div className="guide-step-visual" aria-hidden>
                  <span>{index + 1}</span>
                </div>
                <div className="guide-step-content">
                  <div className="guide-step-heading">
                    <BookOpen size={20} weight="duotone" aria-hidden="true" />
                    <h2 className="guide-step-title">{step.title}</h2>
                  </div>
                  <p className="guide-step-body">{step.body}</p>
                  <a
                    href={step.href}
                    target={step.href.startsWith("http") ? "_blank" : undefined}
                    rel={step.href.startsWith("http") ? "noreferrer" : undefined}
                    className="guide-step-reference"
                  >
                    Reference: {step.reference}
                    <span aria-hidden>↗</span>
                  </a>
                </div>
              </article>
            ))}
            </div>
        </div>

      </main>
      <SiteFooter />
    </>
  );
}
