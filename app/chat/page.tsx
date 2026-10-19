/* ═══════════════════════════════════════════════════════════════
   Velora — AI Chat Page
   Full-screen streaming chat with the Velora AI assistant.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { ChatInterface } from '@/components/planner/ChatInterface';
import { UsageWidget } from '@/components/ui/UsageWidget';

export default function ChatPage() {
  const streaming = useStreamingResponse();

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>
            Chat with Velora
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ask anything about event planning — get instant, expert AI advice.
          </p>
        </div>

        <ChatInterface streaming={streaming} />
      </div>

      <UsageWidget />
    </div>
  );
}
