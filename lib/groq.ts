/* ═══════════════════════════════════════════════════════════════
   Velora — Groq Client Singleton
   Manages Groq SDK initialization and chat completion helpers.
   ═══════════════════════════════════════════════════════════════ */

import Groq from 'groq-sdk';
import type { GroqModel } from '@/types/event';

/** Validated Groq API key retrieval — throws descriptive error if missing */
function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.trim() === '' || key === 'your_key_here') {
    throw new Error(
      'GROQ_API_KEY is not configured. Please set it in your .env.local file. ' +
        'Get a key at https://console.groq.com'
    );
  }
  return key.trim();
}

/** Singleton Groq client — persists across hot reloads via globalThis */
type GroqStore = { client: Groq | null };

const store: GroqStore =
  ((globalThis as Record<string, unknown>).__groqClient as GroqStore) ??
  (() => {
    const s: GroqStore = { client: null };
    (globalThis as Record<string, unknown>).__groqClient = s;
    return s;
  })();

/** Get or create the singleton Groq client */
export function getGroqClient(): Groq {
  if (!store.client) {
    store.client = new Groq({ apiKey: getApiKey() });
  }
  return store.client;
}

/** Message shape for chat completions */
export interface ChatCompletionMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

/** Result shape from a chat completion call */
export interface ChatCompletionResult {
  readonly content: string;
  readonly model: GroqModel;
  readonly tokensUsed: number;
  readonly finishReason: string;
}

/**
 * Execute a non-streaming chat completion against the Groq API.
 * @param messages - Array of messages forming the conversation
 * @param model - Which Groq model to use
 * @param temperature - Sampling temperature (0-1)
 * @param maxTokens - Maximum response tokens
 */
export async function chatCompletion(
  messages: ReadonlyArray<ChatCompletionMessage>,
  model: GroqModel,
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<ChatCompletionResult> {
  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature,
    max_tokens: maxTokens,
  });

  const choice = response.choices[0];
  if (!choice?.message?.content) {
    throw new Error('Groq API returned an empty response');
  }

  return {
    content: choice.message.content,
    model,
    tokensUsed: response.usage?.total_tokens ?? 0,
    finishReason: choice.finish_reason ?? 'unknown',
  };
}

/**
 * Create a streaming chat completion (returns the raw Groq stream).
 * Caller is responsible for iterating the stream and sending SSE events.
 */
export async function chatCompletionStream(
  messages: ReadonlyArray<ChatCompletionMessage>,
  model: GroqModel,
  temperature: number = 0.7,
  maxTokens: number = 2000
) {
  const client = getGroqClient();

  return client.chat.completions.create({
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });
}
