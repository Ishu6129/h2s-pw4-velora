/* ═══════════════════════════════════════════════════════════════
   Velora — Usage Widget Component
   Fixed-position real-time API usage monitor.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface EndpointUsage {
  readonly endpoint: string;
  readonly remainingRequests: number;
  readonly totalRequests: number;
  readonly windowMs: number;
}

interface UsageResponse {
  readonly usage: ReadonlyArray<EndpointUsage>;
}

export function UsageWidget() {
  const [usage, setUsage] = useState<ReadonlyArray<EndpointUsage>>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/usage');
      if (res.ok) {
        const data = (await res.json()) as UsageResponse;
        setUsage(data.usage);
        setFetchError(false);
      }
    } catch {
      setFetchError(true);
    }
  }, []);

  useEffect(() => {
    void fetchUsage();
    const interval = setInterval(() => {
      void fetchUsage();
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchUsage]);

  const getStatusClass = useCallback((remaining: number, total: number): string => {
    const ratio = remaining / total;
    if (ratio > 0.5) return 'active';
    if (ratio > 0.2) return 'warning';
    return 'danger';
  }, []);

  const overallStatus = usage.length > 0
    ? getStatusClass(
        Math.min(...usage.map((u) => u.remainingRequests)),
        Math.max(...usage.map((u) => u.totalRequests + u.remainingRequests), 1)
      )
    : 'active';

  return (
    <div className="usage-widget" role="status" aria-live="polite">
      <div className={`usage-dot ${fetchError ? 'danger' : overallStatus}`} />
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse API usage details' : 'Expand API usage details'}
        aria-expanded={isExpanded}
        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
      >
        {fetchError ? 'API Status' : `${usage.reduce((s, u) => s + u.remainingRequests, 0)} req left`}
      </button>

      {isExpanded && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md)',
            minWidth: '220px',
            boxShadow: 'var(--shadow-lg)',
          }}
          role="region"
          aria-label="API usage details"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
            API Usage
          </div>
          {usage.map((u) => (
            <div key={u.endpoint} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {u.endpoint}
              </span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {u.remainingRequests} left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
