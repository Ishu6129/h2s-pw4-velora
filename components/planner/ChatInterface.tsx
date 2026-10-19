/* ═══════════════════════════════════════════════════════════════
   Velora — Chat Interface Component
   Streaming chat with the AI event planning assistant.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { UseStreamingResponseReturn } from '@/hooks/useStreamingResponse';
import { Badge } from '@/components/ui/Badge';

interface ChatInterfaceProps {
  readonly streaming: UseStreamingResponseReturn;
}

export function ChatInterface({ streaming }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [streaming.messages, scrollToBottom]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || streaming.isStreaming) return;
    setInput('');
    void streaming.sendMessage(trimmed);
  }, [input, streaming]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="chat-container">
      {/* Messages Area */}
      <div className="chat-messages" role="log" aria-label="Chat messages" aria-live="polite" aria-atomic="false">
        {streaming.messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) var(--space-xl)', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }} aria-hidden="true">💬</div>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
              Start a Conversation
            </h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              Ask me anything about planning your event — from venue ideas to budget tips, vendor recommendations to timeline planning.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
              {[
                'What flowers are best for a spring wedding?',
                'Help me plan a 50th birthday party for $3,000',
                'What should my wedding timeline look like?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  aria-label={`Use suggestion: ${suggestion}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {streaming.messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role}`}
            aria-label={`${msg.role === 'user' ? 'You' : 'Velora'}: ${msg.content || 'Thinking...'}`}
          >
            {msg.content || (
              <div className="streaming-indicator" role="status" aria-live="polite">
                <span className="streaming-dot" />
                <span className="streaming-dot" />
                <span className="streaming-dot" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {streaming.error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: 'var(--space-sm) var(--space-lg)',
            background: 'var(--status-danger-dim)',
            color: 'var(--status-danger)',
            fontSize: '0.85rem',
            borderTop: '1px solid rgba(248, 113, 113, 0.2)',
          }}
        >
          {streaming.error}
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-area">
        {streaming.currentModel && (
          <div style={{ marginBottom: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <Badge variant="accent" icon="🤖">{streaming.currentModel.split('-').pop()}</Badge>
            {streaming.isStreaming && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={streaming.stopStreaming}
                aria-label="Stop generating response"
                style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}
              >
                ■ Stop
              </button>
            )}
          </div>
        )}
        <div className="chat-input-wrapper">
          <label htmlFor="chat-input" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            Type your message
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about your event..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={streaming.isStreaming}
            aria-label="Chat message input"
          />
          <button
            className="btn btn-primary btn-icon"
            onClick={handleSend}
            disabled={streaming.isStreaming || !input.trim()}
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xs)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>Shift+Enter for new line</span>
          {streaming.messages.length > 0 && (
            <button
              className="btn btn-ghost"
              onClick={streaming.clearMessages}
              style={{ padding: '0 var(--space-xs)', fontSize: '0.7rem' }}
              aria-label="Clear chat history"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
