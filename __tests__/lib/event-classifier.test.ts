/* ═══════════════════════════════════════════════════════════════
   Velora — Event Classifier Tests
   Tests for heuristic complexity classification.
   ═══════════════════════════════════════════════════════════════ */

import { describe, it, expect } from 'vitest';
import { classifyEventQuery, estimateTokens } from '@/lib/event-classifier';

describe('Event Classifier', () => {
  describe('estimateTokens', () => {
    it('should estimate 1 token per 4 characters', () => {
      expect(estimateTokens('abcd')).toBe(1);
    });

    it('should round up partial tokens', () => {
      expect(estimateTokens('abc')).toBe(1);
      expect(estimateTokens('abcde')).toBe(2);
    });

    it('should return 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('should handle long text', () => {
      const longText = 'a'.repeat(1000);
      expect(estimateTokens(longText)).toBe(250);
    });
  });

  describe('classifyEventQuery', () => {
    describe('complexity classification', () => {
      it('should classify budget breakdown requests as complex', () => {
        const result = classifyEventQuery(
          'I need a detailed budget breakdown and vendor comparison for a 200 guest destination wedding with custom decorations and timeline creation'
        );
        expect(result.complexity).toBe('complex');
        expect(result.model).toBe('openai/gpt-oss-120b');
      });

      it('should classify simple greetings as simple', () => {
        const result = classifyEventQuery('hello');
        expect(result.complexity).toBe('simple');
        expect(result.model).toBe('openai/gpt-oss-20b');
      });

      it('should classify simple questions as simple', () => {
        const result = classifyEventQuery('What is the average cost of a wedding cake?');
        expect(result.complexity).toBe('simple');
        expect(result.model).toBe('openai/gpt-oss-20b');
      });

      it('should classify multi-day event planning as complex', () => {
        const result = classifyEventQuery(
          'Plan a multi-day destination wedding with budget allocation across venue, catering, and entertainment coordination'
        );
        expect(result.complexity).toBe('complex');
      });

      it('should classify recommendation requests as simple', () => {
        const result = classifyEventQuery('Can you recommend some good florists?');
        expect(result.complexity).toBe('simple');
      });
    });

    describe('event type detection', () => {
      it('should detect wedding events', () => {
        const result = classifyEventQuery('Help me plan my wedding reception');
        expect(result.eventType).toBe('wedding');
      });

      it('should detect birthday events', () => {
        const result = classifyEventQuery('Planning a 50th birthday party');
        expect(result.eventType).toBe('birthday');
      });

      it('should detect community events', () => {
        const result = classifyEventQuery('Organizing a charity fundraiser gala');
        expect(result.eventType).toBe('community');
      });

      it('should return null when no event type is detected', () => {
        const result = classifyEventQuery('What is good food?');
        expect(result.eventType).toBeNull();
      });
    });

    describe('category detection', () => {
      it('should detect venue category', () => {
        const result = classifyEventQuery('I need a garden venue for my event');
        expect(result.detectedCategories).toContain('venue');
      });

      it('should detect multiple categories', () => {
        const result = classifyEventQuery(
          'I need a venue, catering, and a photographer for my event'
        );
        expect(result.detectedCategories).toContain('venue');
        expect(result.detectedCategories).toContain('catering');
        expect(result.detectedCategories).toContain('photography');
      });

      it('should detect budget category', () => {
        const result = classifyEventQuery('How much does a wedding cost?');
        expect(result.detectedCategories).toContain('budget');
      });

      it('should return empty categories for generic input', () => {
        const result = classifyEventQuery('hello there');
        expect(result.detectedCategories).toHaveLength(0);
      });
    });

    describe('chunking detection', () => {
      it('should not require chunking for short inputs', () => {
        const result = classifyEventQuery('Plan a birthday party');
        expect(result.requiresChunking).toBe(false);
      });

      it('should require chunking for very long inputs', () => {
        const longInput = 'I need a detailed plan for my event. '.repeat(700);
        const result = classifyEventQuery(longInput);
        expect(result.requiresChunking).toBe(true);
        expect(result.estimatedTokens).toBeGreaterThan(6000);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        const result = classifyEventQuery('');
        expect(result.complexity).toBe('simple');
        expect(result.eventType).toBeNull();
        expect(result.detectedCategories).toHaveLength(0);
      });

      it('should handle special characters', () => {
        const result = classifyEventQuery('What about $$$$ for the @#$% event??');
        expect(result).toBeDefined();
        expect(result.model).toBeDefined();
      });

      it('should handle all uppercase', () => {
        const result = classifyEventQuery('PLAN MY WEDDING BUDGET');
        expect(result.eventType).toBe('wedding');
        expect(result.detectedCategories).toContain('budget');
      });
    });
  });
});
