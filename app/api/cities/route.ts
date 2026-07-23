import { NextRequest, NextResponse } from "next/server";
import { City } from "country-state-city";

// City list is derived from the bundled country-state-city dataset. It depends
// on query params, so it must not be statically cached.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const country = (req.nextUrl.searchParams.get("country") || "IN")
    .toUpperCase()
    .slice(0, 2);
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();

  const all = City.getCitiesOfCountry(country) ?? [];

  // The dataset repeats city names across states; collapse to unique names.
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
    // Surface prefix matches ("hyd" → "Hyderabad") ahead of substring matches.
    names.sort(
      (a, b) =>
        Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q))
    );
  }

  return NextResponse.json({ data: names.slice(0, 60) });
}
