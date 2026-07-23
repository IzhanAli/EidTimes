import { NextRequest, NextResponse } from "next/server";
import { City } from "country-state-city";

export const runtime = "nodejs";

// The dataset is static, so a given (country, q) always yields the same list.
// Two caching layers: an in-process memo for warm invocations, and CDN cache
// headers so Vercel's edge serves repeat requests without hitting the function.
const CDN_CACHE = "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800";

// Bounded in-memory cache (per warm instance) keyed by country|q.
const memo = new Map<string, string[]>();
const MEMO_MAX = 500;

function compute(country: string, q: string): string[] {
  const all = City.getCitiesOfCountry(country) ?? [];
  const seen = new Set<string>();
  const names: string[] = [];
  for (const c of all) {
    const name = c.name;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    if (q && !key.includes(q)) continue;
    seen.add(key);
    names.push(name);
  }
  names.sort((a, b) => a.localeCompare(b));
  if (q) {
    names.sort(
      (a, b) =>
        Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q))
    );
  }
  return names.slice(0, 60);
}

export async function GET(req: NextRequest) {
  const country = (req.nextUrl.searchParams.get("country") || "IN")
    .toUpperCase()
    .slice(0, 2);
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase().slice(0, 40);

  const cacheKey = `${country}|${q}`;
  let data = memo.get(cacheKey);
  if (!data) {
    data = compute(country, q);
    if (memo.size >= MEMO_MAX) memo.clear();
    memo.set(cacheKey, data);
  }

  return NextResponse.json({ data }, { headers: { "Cache-Control": CDN_CACHE } });
}
