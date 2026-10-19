/* ═══════════════════════════════════════════════════════════════
   Velora — Event Planner Page
   Form + results split layout for plan generation.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useEventPlanner } from '@/hooks/useEventPlanner';
import { EventPlanForm } from '@/components/planner/EventPlanForm';
import { PlanResults } from '@/components/planner/PlanResults';
import { UsageWidget } from '@/components/ui/UsageWidget';

export default function PlannerPage() {
  const planner = useEventPlanner();

  return (
    <div className="page-wrapper">
      <div className="split-layout">
        {/* Left Sidebar — Form */}
        <aside className="split-sidebar" aria-label="Event planning form">
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>
              Plan Your Event
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Tell us your vision, and Velora AI will craft a personalized plan.
            </p>
          </div>
          <EventPlanForm planner={planner} />
        </aside>

        {/* Right Main — Results */}
        <section className="split-main" aria-label="Event plan results">
          {!planner.plan && !planner.isLoading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }} aria-hidden="true">
                🎉
              </div>
              <h2 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                Your Plan Awaits
              </h2>
              <p style={{ maxWidth: '400px', fontSize: '0.95rem' }}>
                Fill in your event details on the left and click &ldquo;Generate Plan&rdquo; to get a
                comprehensive AI-crafted event plan with budgets, timelines, vendors, and ideas.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-md)',
                marginTop: 'var(--space-2xl)',
                width: '100%',
                maxWidth: '500px',
              }}>
                <div className="card stat-card" style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }} aria-hidden="true">💰</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget</div>
                </div>
                <div className="card stat-card" style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }} aria-hidden="true">📅</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timeline</div>
                </div>
                <div className="card stat-card" style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }} aria-hidden="true">🏪</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendors</div>
                </div>
              </div>
            </div>
          )}

          {planner.isLoading && (
            <div
              role="status"
              aria-live="polite"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '400px',
                gap: 'var(--space-lg)',
              }}
            >
              <div className="spinner" style={{ width: 48, height: 48 }} aria-hidden="true" />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                  Crafting Your Plan
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Velora is analyzing your requirements and building a personalized plan...
                </p>
              </div>
            </div>
          )}

          {planner.plan && (
            <PlanResults
              plan={planner.plan}
              model={planner.model}
              complexity={planner.complexity}
              onReset={planner.resetPlan}
            />
          )}
        </section>
      </div>

      <UsageWidget />
    </div>
  );
}
