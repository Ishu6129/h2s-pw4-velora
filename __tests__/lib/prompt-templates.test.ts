/* ═══════════════════════════════════════════════════════════════
   Velora — Prompt Templates Tests
   Tests for system prompts and template builders.
   ═══════════════════════════════════════════════════════════════ */

import { describe, it, expect } from 'vitest';
import {
  SYSTEM_PROMPT,
  PROMPT_VERSION,
  buildEventPlanPrompt,
  buildQuickQuestionPrompt,
  buildStreamingSystemPrompt,
} from '@/lib/prompt-templates';
import type { EventPlanRequest } from '@/types/event';

describe('Prompt Templates', () => {
  describe('SYSTEM_PROMPT', () => {
    it('should be a non-empty string', () => {
      expect(SYSTEM_PROMPT).toBeTruthy();
      expect(typeof SYSTEM_PROMPT).toBe('string');
      expect(SYSTEM_PROMPT.length).toBeGreaterThan(100);
    });

    it('should include the Velora identity', () => {
      expect(SYSTEM_PROMPT).toContain('Velora');
    });

    it('should mention event planning domain keywords', () => {
      expect(SYSTEM_PROMPT).toContain('wedding');
      expect(SYSTEM_PROMPT).toContain('birthday');
      expect(SYSTEM_PROMPT).toContain('community');
    });

    it('should include budget awareness', () => {
      expect(SYSTEM_PROMPT).toContain('budget');
    });

    it('should include the prompt version', () => {
      expect(SYSTEM_PROMPT).toContain(PROMPT_VERSION);
    });
  });

  describe('PROMPT_VERSION', () => {
    it('should follow semver format', () => {
      expect(PROMPT_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('buildEventPlanPrompt', () => {
    const baseRequest: EventPlanRequest = {
      eventType: 'wedding',
      guestCount: 150,
      budget: 25000,
      date: '2025-06-15',
      location: 'San Francisco, CA',
      description: 'A romantic outdoor wedding',
      preferences: ['outdoor', 'rustic', 'eco-friendly'],
    };

    it('should include the event type', () => {
      const prompt = buildEventPlanPrompt(baseRequest);
      expect(prompt).toContain('wedding');
    });

    it('should include the guest count', () => {
      const prompt = buildEventPlanPrompt(baseRequest);
      expect(prompt).toContain('150');
    });

    it('should include the budget amount', () => {
      const prompt = buildEventPlanPrompt(baseRequest);
      expect(prompt).toContain('25,000');
    });

    it('should include preferences when provided', () => {
      const prompt = buildEventPlanPrompt(baseRequest);
      expect(prompt).toContain('outdoor');
      expect(prompt).toContain('rustic');
      expect(prompt).toContain('eco-friendly');
    });

    it('should handle empty preferences', () => {
      const noPrefs: EventPlanRequest = { ...baseRequest, preferences: [] };
      const prompt = buildEventPlanPrompt(noPrefs);
      expect(prompt).not.toContain('Preferences:');
    });

    it('should include JSON structure instructions', () => {
      const prompt = buildEventPlanPrompt(baseRequest);
      expect(prompt).toContain('JSON');
      expect(prompt).toContain('budgetBreakdown');
      expect(prompt).toContain('timeline');
      expect(prompt).toContain('vendorChecklist');
    });

    it('should include the location', () => {
      const prompt = buildEventPlanPrompt(baseRequest);
      expect(prompt).toContain('San Francisco');
    });

    it('should include the date', () => {
      const prompt = buildEventPlanPrompt(baseRequest);
      expect(prompt).toContain('2025-06-15');
    });
  });

  describe('buildQuickQuestionPrompt', () => {
    it('should include the question', () => {
      const prompt = buildQuickQuestionPrompt('What flowers are best?');
      expect(prompt).toContain('What flowers are best?');
    });

    it('should include context when provided', () => {
      const prompt = buildQuickQuestionPrompt('What flowers?', {
        eventType: 'wedding',
        budget: 10000,
      });
      expect(prompt).toContain('wedding');
      expect(prompt).toContain('10,000');
    });

    it('should work without context', () => {
      const prompt = buildQuickQuestionPrompt('Best DJ?');
      expect(prompt).toContain('Best DJ?');
      expect(prompt).not.toContain('Event Context');
    });

    it('should handle partial context', () => {
      const prompt = buildQuickQuestionPrompt('Venue ideas?', {
        location: 'NYC',
      });
      expect(prompt).toContain('NYC');
    });
  });

  describe('buildStreamingSystemPrompt', () => {
    it('should include the base system prompt', () => {
      const prompt = buildStreamingSystemPrompt();
      expect(prompt).toContain('Velora');
    });

    it('should include context when provided', () => {
      const prompt = buildStreamingSystemPrompt({
        eventType: 'birthday',
        guestCount: 30,
      });
      expect(prompt).toContain('birthday');
      expect(prompt).toContain('30');
    });

    it('should include streaming-specific instructions', () => {
      const prompt = buildStreamingSystemPrompt();
      expect(prompt).toContain('conversation');
    });
  });
});
