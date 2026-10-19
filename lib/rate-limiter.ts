/* ═══════════════════════════════════════════════════════════════
   Velora — Sliding Window Rate Limiter
   IP-based rate limiting with globalThis persistence.
   ═══════════════════════════════════════════════════════════════ */

import type { RateLimitResult } from '@/types/event';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

type RateLimitStore = Map<string, RateLimitEntry>;

/** Persist rate limit state across hot reloads */
const store: RateLimitStore =
  ((globalThis as Record<string, unknown>).__rateLimitStore as RateLimitStore) ??
  (() => {
    const m = new Map<string, RateLimitEntry>();
    (globalThis as Record<string, unknown>).__rateLimitStore = m;
    return m;
  })();

/**
 * Clean expired entries to prevent memory leaks.
 * Called periodically during rate limit checks.
 */
function cleanExpiredEntries(now: number): void {
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request from a given IP to a given endpoint is within rate limits.
 *
 * @param ip - Client IP address
 * @param endpoint - API endpoint identifier
 * @param limit - Maximum requests allowed per window
 * @param windowMs - Time window in milliseconds
 * @returns RateLimitResult with allowed status and rate limit headers
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const key = `${ip}:${endpoint}`;

  // Periodically clean expired entries (every 100th check)
  if (store.size > 0 && store.size % 100 === 0) {
    cleanExpiredEntries(now);
  }

  const existing = store.get(key);

  // If no entry or window has expired, start fresh
  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
      headers: buildHeaders(limit, limit - 1, resetAt),
    };
  }

  // Window is still active — increment count
  existing.count += 1;

  const remaining = Math.max(0, limit - existing.count);
  const allowed = existing.count <= limit;

  return {
    allowed,
    remaining,
    resetAt: existing.resetAt,
    headers: buildHeaders(limit, remaining, existing.resetAt),
  };
}

/** Build standard rate limit response headers */
function buildHeaders(
  limit: number,
  remaining: number,
  resetAt: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetAt),
  };
}

/** Extract client IP from request headers (for API routes) */
export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  return '127.0.0.1';
}

/** Reset the rate limit store — useful for testing */
export function resetRateLimitStore(): void {
  store.clear();
}

/** Get the current store size — useful for monitoring */
export function getRateLimitStoreSize(): number {
  return store.size;
}
