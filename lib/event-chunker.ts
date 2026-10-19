/* ═══════════════════════════════════════════════════════════════
   Velora — Smart Input Chunker
   Splits large inputs at logical boundaries for LLM processing.
   ═══════════════════════════════════════════════════════════════ */

import type { ChunkResult } from '@/types/event';

/** Default max tokens per chunk (with 2000 buffer for response) */
const DEFAULT_MAX_TOKENS = 6000;

/** Approximate characters per token */
const CHARS_PER_TOKEN = 4;

/**
 * Estimate the token count for a given text string.
 * Uses the standard ~4 characters per token heuristic.
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Find logical break points in text for chunking.
 * Prioritizes paragraph breaks > sentence boundaries > word boundaries.
 */
function findBreakPoint(text: string, maxChars: number): number {
  if (text.length <= maxChars) return text.length;

  // Look for a paragraph break within the window
  const paragraphBreak = text.lastIndexOf('\n\n', maxChars);
  if (paragraphBreak > maxChars * 0.5) return paragraphBreak + 2;

  // Look for a single newline
  const newlineBreak = text.lastIndexOf('\n', maxChars);
  if (newlineBreak > maxChars * 0.5) return newlineBreak + 1;

  // Look for a sentence boundary (period followed by space)
  const sentenceBreak = text.lastIndexOf('. ', maxChars);
  if (sentenceBreak > maxChars * 0.3) return sentenceBreak + 2;

  // Look for other sentence endings
  const questionBreak = text.lastIndexOf('? ', maxChars);
  if (questionBreak > maxChars * 0.3) return questionBreak + 2;

  const exclamationBreak = text.lastIndexOf('! ', maxChars);
  if (exclamationBreak > maxChars * 0.3) return exclamationBreak + 2;

  // Look for a comma or semicolon
  const commaBreak = text.lastIndexOf(', ', maxChars);
  if (commaBreak > maxChars * 0.3) return commaBreak + 2;

  // Last resort: word boundary
  const spaceBreak = text.lastIndexOf(' ', maxChars);
  if (spaceBreak > 0) return spaceBreak + 1;

  // Absolute last resort: hard cut
  return maxChars;
}

/**
 * Chunk a text input into segments that fit within the token limit.
 * Each chunk is split at logical boundaries to preserve context.
 *
 * @param text - The input text to chunk
 * @param maxTokensPerChunk - Maximum tokens per chunk (default: 6000)
 * @returns ChunkResult with the chunks and metadata
 */
export function chunkEventInput(
  text: string,
  maxTokensPerChunk: number = DEFAULT_MAX_TOKENS
): ChunkResult {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      chunks: [''],
      totalTokens: 0,
      wasChunked: false,
      chunkCount: 1,
    };
  }

  const totalTokens = estimateTokenCount(trimmed);
  const maxChars = maxTokensPerChunk * CHARS_PER_TOKEN;

  // If it fits in one chunk, return as-is
  if (trimmed.length <= maxChars) {
    return {
      chunks: [trimmed],
      totalTokens,
      wasChunked: false,
      chunkCount: 1,
    };
  }

  // Split into chunks at logical boundaries
  const chunks: string[] = [];
  let remaining = trimmed;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining.trim());
      break;
    }

    const breakPoint = findBreakPoint(remaining, maxChars);
    const chunk = remaining.slice(0, breakPoint).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    remaining = remaining.slice(breakPoint).trim();
  }

  return {
    chunks,
    totalTokens,
    wasChunked: chunks.length > 1,
    chunkCount: chunks.length,
  };
}

/**
 * Extract the most relevant section of a long input for a focused query.
 * Useful when we need just one chunk but want the most important part.
 */
export function extractRelevantSection(
  text: string,
  maxTokens: number = DEFAULT_MAX_TOKENS
): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const trimmed = text.trim();

  if (trimmed.length <= maxChars) return trimmed;

  // Take the beginning (usually contains the most context)
  // and the end (usually contains the most recent/specific info)
  const headSize = Math.floor(maxChars * 0.7);
  const tailSize = maxChars - headSize - 50; // 50 chars for separator

  const head = trimmed.slice(0, findBreakPoint(trimmed, headSize));
  const tail = trimmed.slice(trimmed.length - tailSize);

  return `${head}\n\n[...content truncated for brevity...]\n\n${tail}`;
}
