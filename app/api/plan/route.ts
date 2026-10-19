/* ═══════════════════════════════════════════════════════════════
   Velora — Plan Generation API
   POST /api/plan — Generate a comprehensive event plan.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { eventPlanRequestSchema, eventPlanSchema } from '@/lib/validators';
import { chatCompletion } from '@/lib/groq';
import { SYSTEM_PROMPT, buildEventPlanPrompt } from '@/lib/prompt-templates';
import { classifyEventQuery } from '@/lib/event-classifier';
import { chunkEventInput, extractRelevantSection } from '@/lib/event-chunker';
import { checkRateLimit, extractClientIp } from '@/lib/rate-limiter';
import type { ApiErrorResponse } from '@/types/event';

/** Rate limit: 10 plan generations per 15 minutes per IP */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Rate limiting
    const ip = extractClientIp(request);
    const rateCheck = checkRateLimit(ip, 'plan', RATE_LIMIT, RATE_WINDOW_MS);

    if (!rateCheck.allowed) {
      const errorBody: ApiErrorResponse = {
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        details: `Limit resets at ${new Date(rateCheck.resetAt).toISOString()}`,
      };
      return NextResponse.json(errorBody, {
        status: 429,
        headers: rateCheck.headers,
      });
    }

    // 2. Parse and validate input
    const body: unknown = await request.json();
    const validated = eventPlanRequestSchema.parse(body);

    // 3. Classify query complexity
    const fullText = `${validated.eventType} ${validated.description} ${validated.preferences.join(' ')} ${validated.guestCount} guests $${validated.budget} budget`;
    const classification = classifyEventQuery(fullText);

    // 4. Handle chunking for large inputs
    let description = validated.description;
    if (classification.requiresChunking) {
      description = extractRelevantSection(validated.description);
    } else {
      const chunkResult = chunkEventInput(validated.description);
      if (chunkResult.wasChunked) {
        description = chunkResult.chunks[0] ?? validated.description;
      }
    }

    // 5. Build prompt and call AI
    const planRequest = { ...validated, description };
    const userPrompt = buildEventPlanPrompt(planRequest);

    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      classification.model,
      0.7,
      4000
    );

    // 6. Parse and validate AI response
    let parsedPlan: unknown;
    try {
      // Strip markdown code blocks if present
      let cleanContent = result.content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      parsedPlan = JSON.parse(cleanContent);
    } catch {
      // If JSON parsing fails, return the raw response as a summary
      return NextResponse.json(
        {
          plan: {
            summary: result.content,
            eventType: validated.eventType,
            budgetBreakdown: [],
            timeline: [],
            vendorChecklist: [],
            personalizedIdeas: [],
            tips: [],
          },
          model: result.model,
          tokensUsed: result.tokensUsed,
          classification: {
            complexity: classification.complexity,
            model: classification.model,
          },
        },
        { status: 200, headers: rateCheck.headers }
      );
    }

    // Validate the parsed plan against our schema
    const validatedPlan = eventPlanSchema.safeParse(parsedPlan);

    const plan = validatedPlan.success
      ? validatedPlan.data
      : {
          summary: result.content.slice(0, 500),
          eventType: validated.eventType,
          budgetBreakdown: [],
          timeline: [],
          vendorChecklist: [],
          personalizedIdeas: [],
          tips: [],
        };

    return NextResponse.json(
      {
        plan,
        model: result.model,
        tokensUsed: result.tokensUsed,
        classification: {
          complexity: classification.complexity,
          model: classification.model,
        },
      },
      { status: 200, headers: rateCheck.headers }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errorBody: ApiErrorResponse = {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      };
      return NextResponse.json(errorBody, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      const errorBody: ApiErrorResponse = {
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
      };
      return NextResponse.json(errorBody, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorBody: ApiErrorResponse = {
      error: message,
      code: 'INTERNAL_ERROR',
    };
    return NextResponse.json(errorBody, { status: 500 });
  }
}
