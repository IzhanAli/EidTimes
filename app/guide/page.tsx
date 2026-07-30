import EidGuide from "@/components/EidGuide";
import type { Occasion } from "@/lib/types";

export const metadata = {
  title: "Eid Guide — Eidgah Times",
  description: "Practical guides for Eid al-Fitr and Eid al-Adha.",
};

export default function GuidePage({ searchParams }: { searchParams: { eid?: string } }) {
  const initialOccasion: Occasion = searchParams.eid === "eid_al_adha" ? "eid_al_adha" : "eid_al_fitr";
  return <EidGuide initialOccasion={initialOccasion} />;
}
