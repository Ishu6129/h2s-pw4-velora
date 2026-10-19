/* ═══════════════════════════════════════════════════════════════
   Velora — Plan Results Component
   Displays the generated event plan with tabs for each section.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState, useCallback, useMemo } from 'react';
import type { EventPlan } from '@/types/event';
import { Badge } from '@/components/ui/Badge';

interface PlanResultsProps {
  readonly plan: EventPlan;
  readonly model: string;
  readonly complexity: string;
  readonly onReset: () => void;
}

type TabId = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas';

const TABS: ReadonlyArray<{ id: TabId; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'vendors', label: 'Vendors', icon: '🏪' },
  { id: 'ideas', label: 'Ideas', icon: '💡' },
];

export function PlanResults({ plan, model, complexity, onReset }: PlanResultsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const handleTabClick = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
  }, []);

  const totalBudget = useMemo(
    () => plan.budgetBreakdown.reduce((sum, item) => sum + item.estimatedCost, 0),
    [plan.budgetBreakdown]
  );

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <Badge variant="accent" icon="🤖">{model.split('-').pop()}</Badge>
          <Badge variant={complexity === 'complex' ? 'danger' : complexity === 'moderate' ? 'warning' : 'success'}>
            {complexity}
          </Badge>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onReset} aria-label="Start a new plan">
          ← New Plan
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Plan sections" className="tab-list">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            className="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span aria-hidden="true">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="tab-panel"
      >
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Plan Summary</h3>
              <p style={{ lineHeight: 1.8 }}>{plan.summary}</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div className="card stat-card">
                <div className="stat-value">${totalBudget.toLocaleString()}</div>
                <div className="stat-label">Total Budget</div>
              </div>
              <div className="card stat-card">
                <div className="stat-value">{plan.vendorChecklist.length}</div>
                <div className="stat-label">Vendors</div>
              </div>
              <div className="card stat-card">
                <div className="stat-value">{plan.timeline.length}</div>
                <div className="stat-label">Milestones</div>
              </div>
              <div className="card stat-card">
                <div className="stat-value">{plan.personalizedIdeas.length}</div>
                <div className="stat-label">Ideas</div>
              </div>
            </div>

            {/* Tips */}
            {plan.tips.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 'var(--space-md)' }}>💡 Pro Tips</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {plan.tips.map((tip, i) => (
                    <li key={i} style={{ display: 'flex', gap: 'var(--space-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span aria-hidden="true" style={{ color: 'var(--accent)' }}>•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="animate-fade-in">
            <div className="budget-bar" style={{ marginBottom: 'var(--space-lg)' }}>
              <span className="budget-amount">${totalBudget.toLocaleString()}</span>
              <span className="budget-label">Estimated Total</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {plan.budgetBreakdown.map((item, i) => (
                <div key={i} className="card" style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                    <h4 style={{ fontSize: '0.95rem' }}>{item.category}</h4>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>
                      ${item.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-track" style={{ marginBottom: 'var(--space-sm)' }}>
                    <div className="progress-fill" style={{ width: `${item.percentOfTotal}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.notes}</span>
                    <Badge variant={item.priority === 'essential' ? 'danger' : item.priority === 'recommended' ? 'warning' : 'info'}>
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="animate-fade-in timeline">
            {plan.timeline.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-date">{item.date}</div>
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-desc">{item.description}</div>
                <Badge variant="accent" icon="📂">{item.category}</Badge>
              </div>
            ))}
            {plan.timeline.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No timeline milestones generated. Try a more detailed description.
              </p>
            )}
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {plan.vendorChecklist.map((vendor) => (
              <div key={vendor.id} className="vendor-card">
                <div className="vendor-avatar" aria-hidden="true">
                  {vendor.category === 'venue' ? '🏛️' :
                   vendor.category === 'catering' ? '🍽️' :
                   vendor.category === 'photography' ? '📸' :
                   vendor.category === 'music' ? '🎵' :
                   vendor.category === 'decor' ? '🎨' :
                   vendor.category === 'florist' ? '💐' :
                   vendor.category === 'bakery' ? '🎂' : '📦'}
                </div>
                <div className="vendor-info">
                  <div className="vendor-name">{vendor.vendor}</div>
                  <div className="vendor-detail">{vendor.description}</div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                    <Badge variant="gold">${vendor.estimatedCost.toLocaleString()}</Badge>
                    <Badge variant={vendor.priority === 'high' ? 'danger' : vendor.priority === 'medium' ? 'warning' : 'info'}>
                      {vendor.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {plan.vendorChecklist.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No vendor recommendations generated. Try providing more event details.
              </p>
            )}
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className="animate-fade-in features-grid">
            {plan.personalizedIdeas.map((idea, i) => (
              <div key={i} className="card feature-card">
                <h4 className="feature-title">{idea.title}</h4>
                <p className="feature-desc">{idea.description}</p>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                  <Badge variant="accent">{idea.category}</Badge>
                  <Badge variant="gold">${idea.estimatedCost.toLocaleString()}</Badge>
                  <Badge variant={idea.difficulty === 'easy' ? 'success' : idea.difficulty === 'medium' ? 'warning' : 'danger'}>
                    {idea.difficulty}
                  </Badge>
                </div>
              </div>
            ))}
            {plan.personalizedIdeas.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No personalized ideas generated. Add more details about your preferences.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
