/* ═══════════════════════════════════════════════════════════════
   Velora — Groq Client Tests
   Tests for Groq SDK initialization and helpers.
   ═══════════════════════════════════════════════════════════════ */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Groq Client', () => {
  const originalEnv = process.env.GROQ_API_KEY;

  beforeEach(() => {
    // Reset module cache for each test to re-evaluate imports
    vi.resetModules();
    // Clear globalThis singleton
    delete (globalThis as Record<string, unknown>).__groqClient;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.GROQ_API_KEY = originalEnv;
    } else {
      delete process.env.GROQ_API_KEY;
    }
  });

  it('should throw a descriptive error when GROQ_API_KEY is missing', async () => {
    delete process.env.GROQ_API_KEY;
    const { getGroqClient } = await import('@/lib/groq');
    expect(() => getGroqClient()).toThrow('GROQ_API_KEY is not configured');
  });

  it('should throw when GROQ_API_KEY is empty string', async () => {
    process.env.GROQ_API_KEY = '';
    const { getGroqClient } = await import('@/lib/groq');
    expect(() => getGroqClient()).toThrow('GROQ_API_KEY is not configured');
  });

  it('should throw when GROQ_API_KEY is placeholder value', async () => {
    process.env.GROQ_API_KEY = 'your_key_here';
    const { getGroqClient } = await import('@/lib/groq');
    expect(() => getGroqClient()).toThrow('GROQ_API_KEY is not configured');
  });

  it('should initialize client with valid API key', async () => {
    process.env.GROQ_API_KEY = 'gsk_test_valid_key_12345';
    const { getGroqClient } = await import('@/lib/groq');
    const client = getGroqClient();
    expect(client).toBeDefined();
    expect(client).toHaveProperty('chat');
  });

  it('should return the same singleton instance on repeated calls', async () => {
    process.env.GROQ_API_KEY = 'gsk_test_valid_key_12345';
    const { getGroqClient } = await import('@/lib/groq');
    const client1 = getGroqClient();
    const client2 = getGroqClient();
    expect(client1).toBe(client2);
  });

  it('should include the error message with setup instructions', async () => {
    delete process.env.GROQ_API_KEY;
    const { getGroqClient } = await import('@/lib/groq');
    try {
      getGroqClient();
      expect.fail('Expected an error to be thrown');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Error);
      const err = error as Error;
      expect(err.message).toContain('console.groq.com');
      expect(err.message).toContain('.env.local');
    }
  });

  it('should export chatCompletion function', async () => {
    const groqModule = await import('@/lib/groq');
    expect(typeof groqModule.chatCompletion).toBe('function');
  });

  it('should export chatCompletionStream function', async () => {
    const groqModule = await import('@/lib/groq');
    expect(typeof groqModule.chatCompletionStream).toBe('function');
  });
});
