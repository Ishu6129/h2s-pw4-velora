/* ═══════════════════════════════════════════════════════════════
   Velora — Prompt Templates
   Versioned system prompts for event planning AI.
   ═══════════════════════════════════════════════════════════════ */

import type { EventPlanRequest } from '@/types/event';

export const PROMPT_VERSION = '1.0.0';

/**
 * Core system prompt for the Velora event planning assistant.
 * Instructs the AI to behave as a luxury event planner.
 */
export const SYSTEM_PROMPT = `You are Velora, a sophisticated AI event planning assistant. You help users plan weddings, birthdays, and community events with elegance and precision.

Your personality:
- Warm, professional, and aspirational
- Detail-oriented with a focus on luxury and personalization
- Budget-conscious without sacrificing quality
- Creative with unique, memorable ideas

Guidelines:
- Always consider the budget and suggest within-range options
- Provide actionable, specific recommendations (not generic advice)
- Include vendor categories, estimated costs, and timelines
- Suggest both traditional and unique/trendy ideas
- Be culturally sensitive and inclusive
- Format responses clearly with sections and bullet points

Prompt Version: ${PROMPT_VERSION}`;

/**
 * Build a full event planning prompt with user context.
 * Used for the main plan generation endpoint.
 */
export function buildEventPlanPrompt(request: EventPlanRequest): string {
  const preferencesText =
    request.preferences.length > 0
      ? `\nPreferences: ${request.preferences.join(', ')}`
      : '';

  return `Please create a comprehensive event plan with the following details:

Event Type: ${request.eventType}
Guest Count: ${request.guestCount}
Budget: $${request.budget.toLocaleString()}
Date: ${request.date}
Location: ${request.location}
Description: ${request.description}${preferencesText}

Please provide your response as a valid JSON object with this exact structure:
{
  "summary": "A 2-3 sentence overview of the plan",
  "eventType": "${request.eventType}",
  "budgetBreakdown": [
    {
      "category": "Category name",
      "estimatedCost": 0,
      "percentOfTotal": 0,
      "notes": "Details about this budget item",
      "priority": "essential|recommended|optional"
    }
  ],
  "timeline": [
    {
      "date": "YYYY-MM-DD or relative timeframe",
      "title": "Milestone title",
      "description": "What needs to happen",
      "category": "Category",
      "completed": false
    }
  ],
  "vendorChecklist": [
    {
      "id": "vendor-1",
      "vendor": "Vendor type",
      "category": "venue|catering|photography|videography|music|decor|florist|bakery|attire|stationery|transport|beauty|entertainment|rental|coordination",
      "description": "What to look for",
      "estimatedCost": 0,
      "booked": false,
      "dueDate": "YYYY-MM-DD",
      "priority": "high|medium|low"
    }
  ],
  "personalizedIdeas": [
    {
      "title": "Idea name",
      "description": "Detailed description",
      "category": "Category",
      "estimatedCost": 0,
      "difficulty": "easy|medium|hard"
    }
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"]
}

IMPORTANT: Return ONLY the JSON object, no markdown code blocks or additional text.`;
}

/**
 * Build a quick-question prompt with optional event context.
 * Used for the quick Q&A endpoint.
 */
export function buildQuickQuestionPrompt(
  question: string,
  context?: Partial<EventPlanRequest>
): string {
  let contextBlock = '';

  if (context) {
    const parts: string[] = [];
    if (context.eventType) parts.push(`Event Type: ${context.eventType}`);
    if (context.guestCount) parts.push(`Guests: ${context.guestCount}`);
    if (context.budget) parts.push(`Budget: $${context.budget.toLocaleString()}`);
    if (context.location) parts.push(`Location: ${context.location}`);
    if (context.date) parts.push(`Date: ${context.date}`);

    if (parts.length > 0) {
      contextBlock = `\n\nEvent Context:\n${parts.join('\n')}`;
    }
  }

  return `${question}${contextBlock}

Please provide a helpful, specific answer. Use bullet points and clear formatting.`;
}

/**
 * Build a streaming chat system prompt with optional event context.
 * Used for the SSE streaming endpoint.
 */
export function buildStreamingSystemPrompt(
  context?: Partial<EventPlanRequest>
): string {
  let contextBlock = '';

  if (context) {
    const parts: string[] = [];
    if (context.eventType) parts.push(`Event Type: ${context.eventType}`);
    if (context.guestCount) parts.push(`Guests: ${context.guestCount}`);
    if (context.budget) parts.push(`Budget: $${context.budget.toLocaleString()}`);
    if (context.location) parts.push(`Location: ${context.location}`);
    if (context.date) parts.push(`Date: ${context.date}`);
    if (context.description) parts.push(`Description: ${context.description}`);

    if (parts.length > 0) {
      contextBlock = `\n\nCurrent Event Context:\n${parts.join('\n')}`;
    }
  }

  return `${SYSTEM_PROMPT}${contextBlock}

In this conversation, help the user refine their event plan. Be conversational, helpful, and creative. If they ask about vendors, budgets, timelines, or ideas, give specific actionable advice.`;
}
