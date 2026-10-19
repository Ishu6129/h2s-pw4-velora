/* ═══════════════════════════════════════════════════════════════
   Velora — Zod Validators
   All API input and AI output validation schemas.
   ═══════════════════════════════════════════════════════════════ */

import { z } from 'zod';

/** Maximum allowed description/prompt length */
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_QUESTION_LENGTH = 2000;
const MAX_PREFERENCES = 20;
const MAX_MESSAGES = 50;

/** Valid event types */
const EVENT_TYPES = ['wedding', 'birthday', 'community'] as const;

/* ─── Request Validators ────────────────────────────────────── */

/** Schema for the main event planning request */
export const eventPlanRequestSchema = z.object({
  eventType: z.enum(EVENT_TYPES, {
    errorMap: () => ({ message: 'Event type must be wedding, birthday, or community' }),
  }),
  guestCount: z
    .number()
    .int('Guest count must be a whole number')
    .min(1, 'At least 1 guest is required')
    .max(10000, 'Guest count cannot exceed 10,000'),
  budget: z
    .number()
    .min(100, 'Budget must be at least $100')
    .max(10_000_000, 'Budget cannot exceed $10,000,000'),
  date: z
    .string()
    .min(1, 'Date is required')
    .max(50, 'Date string is too long')
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Date must be in YYYY-MM-DD format'
    ),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be 200 characters or fewer'),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`),
  preferences: z
    .array(z.string().max(200, 'Each preference must be 200 characters or fewer'))
    .max(MAX_PREFERENCES, `Maximum ${MAX_PREFERENCES} preferences allowed`)
    .default([]),
});

/** Schema for quick question requests */
export const quickQuestionSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .max(MAX_QUESTION_LENGTH, `Question must be ${MAX_QUESTION_LENGTH} characters or fewer`),
  eventContext: z
    .object({
      eventType: z.enum(EVENT_TYPES).optional(),
      guestCount: z.number().int().min(1).max(10000).optional(),
      budget: z.number().min(0).max(10_000_000).optional(),
      date: z.string().max(50).optional(),
      location: z.string().max(200).optional(),
      description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
      preferences: z.array(z.string().max(200)).max(MAX_PREFERENCES).optional(),
    })
    .optional(),
});

/** Schema for SSE streaming chat requests */
export const streamRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(MAX_QUESTION_LENGTH),
      })
    )
    .min(1, 'At least one message is required')
    .max(MAX_MESSAGES, `Maximum ${MAX_MESSAGES} messages allowed`),
  eventContext: z
    .object({
      eventType: z.enum(EVENT_TYPES).optional(),
      guestCount: z.number().int().min(1).max(10000).optional(),
      budget: z.number().min(0).max(10_000_000).optional(),
      date: z.string().max(50).optional(),
      location: z.string().max(200).optional(),
      description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
      preferences: z.array(z.string().max(200)).max(MAX_PREFERENCES).optional(),
    })
    .optional(),
});

/* ─── AI Output Validators ──────────────────────────────────── */

/** Schema for validating AI-generated budget breakdown */
export const budgetItemSchema = z.object({
  category: z.string(),
  estimatedCost: z.number().min(0),
  percentOfTotal: z.number().min(0).max(100),
  notes: z.string(),
  priority: z.enum(['essential', 'recommended', 'optional']),
});

/** Schema for validating AI-generated timeline items */
export const timelineItemSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  completed: z.boolean(),
});

/** Schema for validating AI-generated vendor checklist */
export const vendorChecklistItemSchema = z.object({
  id: z.string(),
  vendor: z.string(),
  category: z.string(),
  description: z.string(),
  estimatedCost: z.number().min(0),
  booked: z.boolean(),
  dueDate: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

/** Schema for validating AI-generated personalized ideas */
export const personalizedIdeaSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  estimatedCost: z.number().min(0),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

/** Full event plan schema for AI output validation */
export const eventPlanSchema = z.object({
  summary: z.string(),
  eventType: z.enum(EVENT_TYPES),
  budgetBreakdown: z.array(budgetItemSchema),
  timeline: z.array(timelineItemSchema),
  vendorChecklist: z.array(vendorChecklistItemSchema),
  personalizedIdeas: z.array(personalizedIdeaSchema),
  tips: z.array(z.string()),
});

/* ─── Inferred Types ────────────────────────────────────────── */

export type ValidatedEventPlanRequest = z.infer<typeof eventPlanRequestSchema>;
export type ValidatedQuickQuestion = z.infer<typeof quickQuestionSchema>;
export type ValidatedStreamRequest = z.infer<typeof streamRequestSchema>;
export type ValidatedEventPlan = z.infer<typeof eventPlanSchema>;
