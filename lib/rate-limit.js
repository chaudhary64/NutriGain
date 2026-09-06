/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Good enough for a single server instance / dev. If the app is ever
 * scaled horizontally, swap the Map for a shared store (e.g. Upstash
 * Redis) — the call signature stays the same.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

const buckets = new Map();
let lastSweep = Date.now();

function sweepExpired(now) {
  // Cheap periodic cleanup so the map doesn't grow forever.
  if (now - lastSweep < 60 * 1000) return;
  lastSweep = now;
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > WINDOW_MS) {
      buckets.delete(key);
    }
  }
}

function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Consume one attempt for the given request + identifier (e.g. email).
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds }.
 */
export function checkRateLimit(request, identifier = '') {
  const now = Date.now();
  sweepExpired(now);

  const key = `${clientIp(request)}::${identifier.toLowerCase()}`;
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true };
  }

  entry.count += 1;

  if (entry.count > MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil(
      (entry.windowStart + WINDOW_MS - now) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}
