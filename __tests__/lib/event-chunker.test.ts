/* ═══════════════════════════════════════════════════════════════
   Velora — Event Chunker Tests
   Tests for smart input chunking and token estimation.
   ═══════════════════════════════════════════════════════════════ */

import { describe, it, expect } from 'vitest';
import {
  chunkEventInput,
  estimateTokenCount,
  extractRelevantSection,
} from '@/lib/event-chunker';

describe('Event Chunker', () => {
  describe('estimateTokenCount', () => {
    it('should estimate ~4 characters per token', () => {
      expect(estimateTokenCount('abcdefgh')).toBe(2);
    });

    it('should round up partial tokens', () => {
      expect(estimateTokenCount('abc')).toBe(1);
    });

    it('should return 0 for empty string', () => {
      expect(estimateTokenCount('')).toBe(0);
    });

    it('should handle single character', () => {
      expect(estimateTokenCount('a')).toBe(1);
    });

    it('should scale linearly with length', () => {
      const short = estimateTokenCount('a'.repeat(100));
      const long = estimateTokenCount('a'.repeat(1000));
      expect(long).toBe(short * 10);
    });
  });

  describe('chunkEventInput', () => {
    it('should return short input as-is without chunking', () => {
      const result = chunkEventInput('Plan a birthday party');
      expect(result.wasChunked).toBe(false);
      expect(result.chunkCount).toBe(1);
      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0]).toBe('Plan a birthday party');
    });

    it('should handle empty input', () => {
      const result = chunkEventInput('');
      expect(result.wasChunked).toBe(false);
      expect(result.chunkCount).toBe(1);
      expect(result.totalTokens).toBe(0);
    });

    it('should handle whitespace-only input', () => {
      const result = chunkEventInput('   \n\n  ');
      expect(result.wasChunked).toBe(false);
      expect(result.totalTokens).toBe(0);
    });

    it('should chunk very long input', () => {
      // Create a long input that exceeds the default token limit (6000 tokens = ~24000 chars)
      const longInput = Array.from({ length: 200 }, (_, i) =>
        `Section ${i + 1}: This is a detailed paragraph about event planning that covers venue selection, catering options, decorations, entertainment, photography, videography, and many other important factors for a successful event.`
      ).join('\n\n');

      const result = chunkEventInput(longInput);
      expect(result.wasChunked).toBe(true);
      expect(result.chunkCount).toBeGreaterThan(1);
      expect(result.chunks.length).toBe(result.chunkCount);
    });

    it('should split at paragraph boundaries when possible', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      // Use a very small token limit to force chunking
      const result = chunkEventInput(text, 5); // ~20 chars per chunk
      expect(result.wasChunked).toBe(true);
      // Chunks should be trimmed
      for (const chunk of result.chunks) {
        expect(chunk.trim()).toBe(chunk);
      }
    });

    it('should split at sentence boundaries as fallback', () => {
      const text = 'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence. Sixth sentence. Seventh sentence.';
      const result = chunkEventInput(text, 8); // ~32 chars per chunk
      expect(result.wasChunked).toBe(true);
      expect(result.chunks.length).toBeGreaterThan(1);
    });

    it('should respect custom maxTokensPerChunk', () => {
      const text = 'a'.repeat(100);
      const result = chunkEventInput(text, 10); // 10 tokens = ~40 chars
      expect(result.wasChunked).toBe(true);
      expect(result.chunkCount).toBeGreaterThan(1);
    });

    it('should preserve total token count', () => {
      const text = 'Hello world, this is a test of the chunking system.';
      const result = chunkEventInput(text);
      expect(result.totalTokens).toBe(estimateTokenCount(text));
    });

    it('should not lose content during chunking', () => {
      const parts = ['Part one content.', 'Part two content.', 'Part three content.'];
      const text = parts.join('\n\n');
      const result = chunkEventInput(text, 5);

      if (result.wasChunked) {
        const rejoined = result.chunks.join(' ');
        for (const part of parts) {
          expect(rejoined).toContain(part.trim());
        }
      }
    });
  });

  describe('extractRelevantSection', () => {
    it('should return short text as-is', () => {
      const text = 'Short input';
      const result = extractRelevantSection(text);
      expect(result).toBe(text);
    });

    it('should truncate long text', () => {
      const text = 'a'.repeat(50000);
      const result = extractRelevantSection(text, 100);
      expect(result.length).toBeLessThan(text.length);
    });

    it('should include truncation indicator for long text', () => {
      const text = 'a'.repeat(50000);
      const result = extractRelevantSection(text, 100);
      expect(result).toContain('truncated');
    });

    it('should preserve head and tail of long text', () => {
      const head = 'START_MARKER ' + 'a'.repeat(1000);
      const middle = 'b'.repeat(50000);
      const tail = 'c'.repeat(1000) + ' END_MARKER';
      const text = head + middle + tail;

      const result = extractRelevantSection(text, 500);
      expect(result).toContain('START_MARKER');
      expect(result).toContain('END_MARKER');
    });

    it('should handle empty input', () => {
      const result = extractRelevantSection('');
      expect(result).toBe('');
    });

    it('should respect maxTokens parameter', () => {
      const text = 'a'.repeat(10000);
      const result = extractRelevantSection(text, 50);
      // 50 tokens * 4 chars = ~200 chars max (plus separator)
      expect(result.length).toBeLessThan(300);
    });
  });
});
