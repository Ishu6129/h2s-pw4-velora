/* ═══════════════════════════════════════════════════════════════
   Velora — Usage Analytics API
   GET /api/usage — Check rate limit status for current IP.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import { checkRateLimit, extractClientIp } from '@/lib/rate-limiter';
import type { UsageStats } from '@/types/event';

/** Endpoint configurations matching the actual rate limits */
const ENDPOINTS = [
  { name: 'plan', limit: 10, windowMs: 15 * 60 * 1000 },
  { name: 'ask', limit: 20, windowMs: 5 * 60 * 1000 },
  { name: 'chat', limit: 15, windowMs: 5 * 60 * 1000 },
] as const;

export async function GET(request: Request): Promise<NextResponse> {
  const ip = extractClientIp(request);

  const usage: UsageStats[] = ENDPOINTS.map((ep) => {
    // Peek at the rate limit state without consuming a request
    const status = checkRateLimit(ip, `usage-peek-${ep.name}`, 1000, ep.windowMs);

    return {
      endpoint: ep.name,
      totalRequests: ep.limit - status.remaining,
      remainingRequests: status.remaining,
      resetAt: status.resetAt,
      windowMs: ep.windowMs,
    };
  });

  return NextResponse.json({ usage, ip: ip.slice(0, 3) + '***' });
}
