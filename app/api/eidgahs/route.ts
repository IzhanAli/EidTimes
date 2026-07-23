import { NextResponse } from "next/server";
import { listEidgahs, createEidgah } from "@/lib/db";
import { parseEidgahInput } from "@/lib/validate";
import { clientIp, rateLimit, tooManyRequests, WRITE_RULES } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await listEidgahs();
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load eidgahs.", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const limit = await rateLimit(clientIp(req), "write", WRITE_RULES);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = parseEidgahInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  try {
    const created = await createEidgah(parsed.value);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save eidgah.", detail: String(err) },
      { status: 500 }
    );
  }
}
