/* ═══════════════════════════════════════════════════════════════
   Velora — Quick Question API
   POST /api/ask — Answer quick event planning questions.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { quickQuestionSchema } from '@/lib/validators';
import { chatCompletion } from '@/lib/groq';
import { SYSTEM_PROMPT, buildQuickQuestionPrompt } from '@/lib/prompt-templates';
import { classifyEventQuery } from '@/lib/event-classifier';
import { checkRateLimit, extractClientIp } from '@/lib/rate-limiter';
import type { ApiErrorResponse } from '@/types/event';

/** Rate limit: 20 questions per 5 minutes per IP */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 5 * 60 * 1000;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Rate limiting
    const ip = extractClientIp(request);
    const rateCheck = checkRateLimit(ip, 'ask', RATE_LIMIT, RATE_WINDOW_MS);

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
    const validated = quickQuestionSchema.parse(body);

    // 3. Classify for model routing
    const classification = classifyEventQuery(validated.question);

    // 4. Build prompt and call AI
    const userPrompt = buildQuickQuestionPrompt(
      validated.question,
      validated.eventContext
    );

    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      classification.model,
      0.7,
      1500
    );

    return NextResponse.json(
      {
        answer: result.content,
        model: result.model,
        tokensUsed: result.tokensUsed,
        complexity: classification.complexity,
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
