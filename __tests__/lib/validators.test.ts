/* ═══════════════════════════════════════════════════════════════
   Velora — Validators Tests
   Comprehensive tests for Zod validation schemas.
   ═══════════════════════════════════════════════════════════════ */

import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  eventPlanRequestSchema,
  quickQuestionSchema,
  streamRequestSchema,
  eventPlanSchema,
} from '@/lib/validators';

describe('Validators', () => {
  describe('eventPlanRequestSchema', () => {
    const validRequest = {
      eventType: 'wedding',
      guestCount: 150,
      budget: 25000,
      date: '2025-06-15',
      location: 'San Francisco, CA',
      description: 'A beautiful outdoor wedding',
      preferences: ['rustic', 'outdoor'],
    };

    it('should accept a valid request', () => {
      const result = eventPlanRequestSchema.parse(validRequest);
      expect(result.eventType).toBe('wedding');
      expect(result.guestCount).toBe(150);
    });

    it('should reject invalid event type', () => {
      expect(() =>
        eventPlanRequestSchema.parse({ ...validRequest, eventType: 'concert' })
      ).toThrow(ZodError);
    });

    it('should reject guest count below minimum', () => {
      expect(() =>
        eventPlanRequestSchema.parse({ ...validRequest, guestCount: 0 })
      ).toThrow(ZodError);
    });

    it('should reject guest count above maximum', () => {
      expect(() =>
        eventPlanRequestSchema.parse({ ...validRequest, guestCount: 10001 })
      ).toThrow(ZodError);
    });

    it('should reject budget below minimum', () => {
      expect(() =>
        eventPlanRequestSchema.parse({ ...validRequest, budget: 50 })
      ).toThrow(ZodError);
    });

    it('should reject invalid date format', () => {
      expect(() =>
        eventPlanRequestSchema.parse({ ...validRequest, date: '15/06/2025' })
      ).toThrow(ZodError);
    });

    it('should reject missing required fields', () => {
      expect(() =>
        eventPlanRequestSchema.parse({ eventType: 'wedding' })
      ).toThrow(ZodError);
    });

    it('should default preferences to empty array', () => {
      const noPrefs = { ...validRequest };
      delete (noPrefs as Record<string, unknown>).preferences;
      const result = eventPlanRequestSchema.parse(noPrefs);
      expect(result.preferences).toEqual([]);
    });

    it('should reject oversized description', () => {
      expect(() =>
        eventPlanRequestSchema.parse({
          ...validRequest,
          description: 'x'.repeat(5001),
        })
      ).toThrow(ZodError);
    });

    it('should accept all valid event types', () => {
      for (const type of ['wedding', 'birthday', 'community']) {
        const result = eventPlanRequestSchema.parse({
          ...validRequest,
          eventType: type,
        });
        expect(result.eventType).toBe(type);
      }
    });

    it('should reject non-integer guest count', () => {
      expect(() =>
        eventPlanRequestSchema.parse({ ...validRequest, guestCount: 150.5 })
      ).toThrow(ZodError);
    });
  });

  describe('quickQuestionSchema', () => {
    it('should accept a valid question', () => {
      const result = quickQuestionSchema.parse({
        question: 'What flowers are best for spring weddings?',
      });
      expect(result.question).toBeTruthy();
    });

    it('should reject empty question', () => {
      expect(() => quickQuestionSchema.parse({ question: '' })).toThrow(ZodError);
    });

    it('should reject oversized question', () => {
      expect(() =>
        quickQuestionSchema.parse({ question: 'x'.repeat(2001) })
      ).toThrow(ZodError);
    });

    it('should accept question with event context', () => {
      const result = quickQuestionSchema.parse({
        question: 'Best DJ?',
        eventContext: { eventType: 'birthday', budget: 5000 },
      });
      expect(result.eventContext?.eventType).toBe('birthday');
    });

    it('should accept question without context', () => {
      const result = quickQuestionSchema.parse({ question: 'Tips?' });
      expect(result.eventContext).toBeUndefined();
    });
  });

  describe('streamRequestSchema', () => {
    it('should accept valid messages', () => {
      const result = streamRequestSchema.parse({
        messages: [{ role: 'user', content: 'Hello' }],
      });
      expect(result.messages).toHaveLength(1);
    });

    it('should reject empty messages array', () => {
      expect(() =>
        streamRequestSchema.parse({ messages: [] })
      ).toThrow(ZodError);
    });

    it('should reject invalid role', () => {
      expect(() =>
        streamRequestSchema.parse({
          messages: [{ role: 'system', content: 'test' }],
        })
      ).toThrow(ZodError);
    });

    it('should reject too many messages', () => {
      const tooMany = Array.from({ length: 51 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }));
      expect(() =>
        streamRequestSchema.parse({ messages: tooMany })
      ).toThrow(ZodError);
    });

    it('should accept messages with event context', () => {
      const result = streamRequestSchema.parse({
        messages: [{ role: 'user', content: 'Help me plan' }],
        eventContext: { eventType: 'community', guestCount: 200 },
      });
      expect(result.eventContext?.eventType).toBe('community');
    });
  });

  describe('eventPlanSchema (AI output)', () => {
    const validPlan = {
      summary: 'A beautiful plan',
      eventType: 'wedding',
      budgetBreakdown: [
        {
          category: 'Venue',
          estimatedCost: 5000,
          percentOfTotal: 40,
          notes: 'Outdoor garden',
          priority: 'essential',
        },
      ],
      timeline: [
        {
          date: '2025-01-15',
          title: 'Book venue',
          description: 'Reserve the garden',
          category: 'Venue',
          completed: false,
        },
      ],
      vendorChecklist: [
        {
          id: 'v-1',
          vendor: 'Caterer',
          category: 'catering',
          description: 'Full-service catering',
          estimatedCost: 3000,
          booked: false,
          dueDate: '2025-03-01',
          priority: 'high',
        },
      ],
      personalizedIdeas: [
        {
          title: 'Photo Booth',
          description: 'Rustic photo booth',
          category: 'Entertainment',
          estimatedCost: 500,
          difficulty: 'easy',
        },
      ],
      tips: ['Book early', 'Compare vendors'],
    };

    it('should accept a valid event plan', () => {
      const result = eventPlanSchema.parse(validPlan);
      expect(result.summary).toBe('A beautiful plan');
    });

    it('should accept plan with empty arrays', () => {
      const minimal = {
        ...validPlan,
        budgetBreakdown: [],
        timeline: [],
        vendorChecklist: [],
        personalizedIdeas: [],
        tips: [],
      };
      const result = eventPlanSchema.parse(minimal);
      expect(result.budgetBreakdown).toHaveLength(0);
    });

    it('should reject negative estimated cost', () => {
      const invalid = {
        ...validPlan,
        budgetBreakdown: [
          { ...validPlan.budgetBreakdown[0], estimatedCost: -100 },
        ],
      };
      expect(() => eventPlanSchema.parse(invalid)).toThrow(ZodError);
    });
  });
});
