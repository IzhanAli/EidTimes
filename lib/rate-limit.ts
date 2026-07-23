import { sql } from "@vercel/postgres";

/** Best-effort client IP from Vercel's proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export type RateRule = { limit: number; windowSec: number };

export type RateResult = { ok: true } | { ok: false; retryAfter: number };

/**
 * Sliding-window per-IP rate limiter backed by the `rate_hits` table (no extra
 * infra). Evaluates every rule; the request is blocked if any window is full.
 * Fails open on a DB error so an outage never locks out legitimate users.
 */
export async function rateLimit(
  ip: string,
  bucket: string,
  rules: RateRule[]
): Promise<RateResult> {
  if (!rules.length) return { ok: true };
  const maxWindow = Math.max(...rules.map((r) => r.windowSec));
  try {
    // Prune this ip+bucket's rows outside the largest window (self-cleaning).
    await sql`
      DELETE FROM rate_hits
      WHERE ip = ${ip} AND bucket = ${bucket}
        AND ts < NOW() - make_interval(secs => ${maxWindow})
    `;
    for (const r of rules) {
      const { rows } = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM rate_hits
        WHERE ip = ${ip} AND bucket = ${bucket}
          AND ts > NOW() - make_interval(secs => ${r.windowSec})
      `;
      if ((rows[0]?.n ?? 0) >= r.limit) {
        return { ok: false, retryAfter: r.windowSec };
      }
    }
    await sql`INSERT INTO rate_hits (ip, bucket) VALUES (${ip}, ${bucket})`;
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down and try again shortly." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}

/** Write-endpoint limits: bursts and sustained abuse both covered. */
export const WRITE_RULES: RateRule[] = [
  { limit: 8, windowSec: 60 },
  { limit: 40, windowSec: 60 * 60 },
];
