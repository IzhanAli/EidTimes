import { headers } from "next/headers";
import Home from "@/components/Home";
import { listEidgahs, getSiteConfig } from "@/lib/db";
import { DEFAULT_SITE_CONFIG } from "@/lib/types";
import type { Eidgah, SiteConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  let initial: Eidgah[] = [];
  try {
    initial = await listEidgahs();
  } catch {
    initial = [];
  }

  let config: SiteConfig = DEFAULT_SITE_CONFIG;
  try {
    config = await getSiteConfig();
  } catch {
    config = DEFAULT_SITE_CONFIG;
  }

  // Vercel sets x-vercel-ip-country on the edge. Falls back to null
  // locally; the client side will then try a public IP-geo service.
  const detectedCountry =
    headers().get("x-vercel-ip-country") ||
    headers().get("cf-ipcountry") || // Cloudflare, in case
    null;

  return (
    <Home
      initial={initial}
      detectedCountry={detectedCountry ? detectedCountry.toUpperCase() : null}
      defaultOccasion={config.activeOccasion}
    />
  );
}
