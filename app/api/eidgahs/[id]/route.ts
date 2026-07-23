import { NextResponse } from "next/server";
import { updateEidgah } from "@/lib/db";
import { parseEidgahInput } from "@/lib/validate";
import { clientIp, rateLimit, tooManyRequests, WRITE_RULES } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const updated = await updateEidgah(params.id, parsed.value);
    if (!updated) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update eidgah.", detail: String(err) },
      { status: 500 }
    );
  }
}
