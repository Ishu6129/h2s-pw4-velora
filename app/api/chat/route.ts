/* ═══════════════════════════════════════════════════════════════
   Velora — SSE Streaming Chat API
   POST /api/chat — Stream AI responses via Server-Sent Events.
   ═══════════════════════════════════════════════════════════════ */

import { ZodError } from 'zod';
import { streamRequestSchema } from '@/lib/validators';
import { chatCompletionStream } from '@/lib/groq';
import { buildStreamingSystemPrompt } from '@/lib/prompt-templates';
import { classifyEventQuery } from '@/lib/event-classifier';
import { checkRateLimit, extractClientIp } from '@/lib/rate-limiter';

/** Rate limit: 15 chat requests per 5 minutes per IP */
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 5 * 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Rate limiting
    const ip = extractClientIp(request);
    const rateCheck = checkRateLimit(ip, 'chat', RATE_LIMIT, RATE_WINDOW_MS);

    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...rateCheck.headers },
        }
      );
    }

    // 2. Parse and validate input
    const body: unknown = await request.json();
    const validated = streamRequestSchema.parse(body);

    // 3. Classify the latest user message
    const lastUserMessage = [...validated.messages]
      .reverse()
      .find((m) => m.role === 'user');

    const classification = classifyEventQuery(lastUserMessage?.content ?? '');

    // 4. Build system prompt with context
    const systemPrompt = buildStreamingSystemPrompt(validated.eventContext);

    // 5. Prepare messages for Groq
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...validated.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // 6. Create SSE stream
    const stream = await chatCompletionStream(
      groqMessages,
      classification.model,
      0.7,
      2000
    );

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata event
          const metaEvent = `data: ${JSON.stringify({
            type: 'meta',
            model: classification.model,
            complexity: classification.complexity,
          })}\n\n`;
          controller.enqueue(encoder.encode(metaEvent));

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const event = `data: ${JSON.stringify({
                type: 'content',
                content,
              })}\n\n`;
              controller.enqueue(encoder.encode(event));
            }
          }

          // Send completion event
          const doneEvent = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
          controller.enqueue(encoder.encode(doneEvent));
          controller.close();
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Stream error';
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            error: message,
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        ...rateCheck.headers,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: message, code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
