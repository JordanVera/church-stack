/**
 * Simple in-memory sliding-window rate limiter for public mutations.
 * Suitable for single-instance / low-traffic launch; replace with Redis later if needed.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function assertRateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(opts.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}

export function rateLimitExceededMessage(retryAfterSec: number) {
  return `Too many requests. Try again in ${retryAfterSec}s.`;
}
