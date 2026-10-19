/* ═══════════════════════════════════════════════════════════════
   Velora — Rate Limiter Tests
   Comprehensive tests for sliding window rate limiting.
   ═══════════════════════════════════════════════════════════════ */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  resetRateLimitStore,
  getRateLimitStoreSize,
  extractClientIp,
} from '@/lib/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  describe('checkRateLimit', () => {
    it('should allow the first request', () => {
      const result = checkRateLimit('192.168.1.1', 'test', 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should decrement remaining count with each request', () => {
      checkRateLimit('192.168.1.1', 'test', 5, 60000);
      const result = checkRateLimit('192.168.1.1', 'test', 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
    });

    it('should deny requests after limit is reached', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('192.168.1.1', 'test', 5, 60000);
      }
      const result = checkRateLimit('192.168.1.1', 'test', 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track different IPs independently', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('192.168.1.1', 'test', 5, 60000);
      }
      const blockedResult = checkRateLimit('192.168.1.1', 'test', 5, 60000);
      expect(blockedResult.allowed).toBe(false);

      const freshResult = checkRateLimit('192.168.1.2', 'test', 5, 60000);
      expect(freshResult.allowed).toBe(true);
      expect(freshResult.remaining).toBe(4);
    });

    it('should track different endpoints independently', () => {
      for (let i = 0; i < 3; i++) {
        checkRateLimit('192.168.1.1', 'endpoint-a', 3, 60000);
      }
      const blockedResult = checkRateLimit('192.168.1.1', 'endpoint-a', 3, 60000);
      expect(blockedResult.allowed).toBe(false);

      const freshResult = checkRateLimit('192.168.1.1', 'endpoint-b', 3, 60000);
      expect(freshResult.allowed).toBe(true);
      expect(freshResult.remaining).toBe(2);
    });

    it('should reset counter after window expires', () => {
      // Use a very short window (1ms)
      checkRateLimit('192.168.1.1', 'test', 1, 1);
      // Wait for window to expire
      const start = Date.now();
      while (Date.now() - start < 5) {
        // busy-wait 5ms
      }
      const result = checkRateLimit('192.168.1.1', 'test', 1, 1);
      expect(result.allowed).toBe(true);
    });

    it('should return correct rate limit headers', () => {
      const result = checkRateLimit('192.168.1.1', 'test', 10, 60000);
      expect(result.headers).toHaveProperty('X-RateLimit-Limit', '10');
      expect(result.headers).toHaveProperty('X-RateLimit-Remaining', '9');
      expect(result.headers).toHaveProperty('X-RateLimit-Reset');
      expect(Number(result.headers['X-RateLimit-Reset'])).toBeGreaterThan(Date.now());
    });

    it('should show 0 remaining when denied', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit('192.168.1.1', 'test', 3, 60000);
      }
      const result = checkRateLimit('192.168.1.1', 'test', 3, 60000);
      expect(result.remaining).toBe(0);
    });

    it('should handle limit of 1', () => {
      const first = checkRateLimit('10.0.0.1', 'strict', 1, 60000);
      expect(first.allowed).toBe(true);
      expect(first.remaining).toBe(0);

      const second = checkRateLimit('10.0.0.1', 'strict', 1, 60000);
      expect(second.allowed).toBe(false);
    });

    it('should handle high volume of requests', () => {
      for (let i = 0; i < 100; i++) {
        checkRateLimit(`ip-${i}`, 'test', 5, 60000);
      }
      expect(getRateLimitStoreSize()).toBeGreaterThanOrEqual(100);
    });
  });

  describe('resetRateLimitStore', () => {
    it('should clear all entries', () => {
      checkRateLimit('192.168.1.1', 'test', 5, 60000);
      checkRateLimit('192.168.1.2', 'test', 5, 60000);
      expect(getRateLimitStoreSize()).toBe(2);

      resetRateLimitStore();
      expect(getRateLimitStoreSize()).toBe(0);
    });

    it('should allow requests after reset', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('192.168.1.1', 'test', 5, 60000);
      }
      const blocked = checkRateLimit('192.168.1.1', 'test', 5, 60000);
      expect(blocked.allowed).toBe(false);

      resetRateLimitStore();

      const fresh = checkRateLimit('192.168.1.1', 'test', 5, 60000);
      expect(fresh.allowed).toBe(true);
    });
  });

  describe('extractClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '203.0.113.50, 70.41.3.18' },
      });
      expect(extractClientIp(request)).toBe('203.0.113.50');
    });

    it('should return 127.0.0.1 when no forwarded header exists', () => {
      const request = new Request('http://localhost');
      expect(extractClientIp(request)).toBe('127.0.0.1');
    });

    it('should handle single IP in forwarded header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '10.0.0.1' },
      });
      expect(extractClientIp(request)).toBe('10.0.0.1');
    });
  });
});
