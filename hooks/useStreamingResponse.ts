/* ═══════════════════════════════════════════════════════════════
   Velora — SSE Streaming Response Hook
   Handles Server-Sent Events for real-time chat responses.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, EventPlanRequest } from '@/types/event';

interface SSEEvent {
  readonly type: 'meta' | 'content' | 'done' | 'error';
  readonly content?: string;
  readonly model?: string;
  readonly complexity?: string;
  readonly error?: string;
}

interface UseStreamingResponseState {
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly isStreaming: boolean;
  readonly error: string;
  readonly currentModel: string;
}

interface UseStreamingResponseActions {
  readonly sendMessage: (content: string, context?: Partial<EventPlanRequest>) => Promise<void>;
  readonly clearMessages: () => void;
  readonly stopStreaming: () => void;
}

export type UseStreamingResponseReturn = UseStreamingResponseState &
  UseStreamingResponseActions;

let messageCounter = 0;

function generateMessageId(): string {
  messageCounter += 1;
  return `msg-${messageCounter}-${Date.now()}`;
}

export function useStreamingResponse(): UseStreamingResponseReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, context?: Partial<EventPlanRequest>) => {
      if (isStreaming) return;

      setError('');
      setIsStreaming(true);

      // Add user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Create assistant message placeholder
      const assistantId = generateMessageId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages([...updatedMessages, assistantMessage]);

      // Prepare abort controller
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            eventContext: context,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error ?? `Request failed with status ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body for streaming');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr) as SSEEvent;

              switch (event.type) {
                case 'meta':
                  if (event.model) setCurrentModel(event.model);
                  break;

                case 'content':
                  if (event.content) {
                    accumulatedContent += event.content;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId
                          ? { ...m, content: accumulatedContent }
                          : m
                      )
                    );
                  }
                  break;

                case 'done':
                  // Update with final model info
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: accumulatedContent, model: currentModel as ChatMessage['model'] }
                        : m
                    )
                  );
                  break;

                case 'error':
                  setError(event.error ?? 'Stream error');
                  break;
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User cancelled — not an error
          return;
        }
        const message = err instanceof Error ? err.message : 'Streaming failed';
        setError(message);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming, currentModel]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError('');
    setCurrentModel('');
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  return {
    messages,
    isStreaming,
    error,
    currentModel,
    sendMessage,
    clearMessages,
    stopStreaming,
  };
}
