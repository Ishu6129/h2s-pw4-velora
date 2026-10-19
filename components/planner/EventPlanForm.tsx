/* ═══════════════════════════════════════════════════════════════
   Velora — Event Plan Form Component
   Multi-step form for collecting event planning details.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import type { EventType } from '@/types/event';
import type { UseEventPlannerReturn } from '@/hooks/useEventPlanner';

interface EventPlanFormProps {
  readonly planner: UseEventPlannerReturn;
}

const EVENT_TYPES: ReadonlyArray<{
  type: EventType;
  icon: string;
  label: string;
}> = [
  { type: 'wedding', icon: '💍', label: 'Wedding' },
  { type: 'birthday', icon: '🎂', label: 'Birthday' },
  { type: 'community', icon: '🎪', label: 'Community' },
];

export function EventPlanForm({ planner }: EventPlanFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void planner.generatePlan();
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Event planning form">
      <fieldset style={{ border: 'none', padding: 0 }}>
        <legend style={{ fontSize: '1.1rem', marginBottom: 'var(--space-lg)', padding: 0 }}>
          Tell us about your event
        </legend>

        {/* Event Type Selector */}
        <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
          <label className="form-label" id="event-type-label">
            Event Type
          </label>
          <div
            className="event-type-selector"
            role="radiogroup"
            aria-labelledby="event-type-label"
          >
            {EVENT_TYPES.map(({ type, icon, label }) => (
              <button
                key={type}
                type="button"
                className={`event-type-btn${planner.eventType === type ? ' selected' : ''}`}
                onClick={() => planner.setEventType(type)}
                role="radio"
                aria-checked={planner.eventType === type}
                aria-label={`Select ${label} event type`}
              >
                <span className="event-type-icon" aria-hidden="true">
                  {icon}
                </span>
                <span className="event-type-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Guest Count & Budget Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-md)',
          }}
        >
          <div className="form-group">
            <label htmlFor="guest-count" className="form-label">
              Guest Count
            </label>
            <input
              id="guest-count"
              type="number"
              className="form-input"
              placeholder="e.g. 150"
              min="1"
              max="10000"
              value={planner.guestCount}
              onChange={(e) => planner.setGuestCount(e.target.value)}
              aria-describedby="guest-count-hint"
            />
            <span id="guest-count-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              1 – 10,000 guests
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="budget" className="form-label">
              Budget (USD)
            </label>
            <input
              id="budget"
              type="number"
              className="form-input"
              placeholder="e.g. 25000"
              min="100"
              max="10000000"
              value={planner.budget}
              onChange={(e) => planner.setBudget(e.target.value)}
              aria-describedby="budget-hint"
            />
            <span id="budget-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              $100 – $10,000,000
            </span>
          </div>
        </div>

        {/* Date & Location Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-md)',
          }}
        >
          <div className="form-group">
            <label htmlFor="event-date" className="form-label">
              Event Date
            </label>
            <input
              id="event-date"
              type="date"
              className="form-input"
              value={planner.date}
              onChange={(e) => planner.setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              id="location"
              type="text"
              className="form-input"
              placeholder="e.g. San Francisco, CA"
              value={planner.location}
              onChange={(e) => planner.setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
          <label htmlFor="description" className="form-label">
            Describe your vision
          </label>
          <textarea
            id="description"
            className="form-textarea"
            placeholder="Tell us about your dream event — themes, style, special requests, dietary needs, cultural traditions..."
            value={planner.description}
            onChange={(e) => planner.setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Preferences */}
        <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
          <label htmlFor="preferences" className="form-label">
            Preferences (comma-separated)
          </label>
          <input
            id="preferences"
            type="text"
            className="form-input"
            placeholder="e.g. outdoor, rustic, eco-friendly, live band"
            value={planner.preferences}
            onChange={(e) => planner.setPreferences(e.target.value)}
          />
        </div>

        {/* Error Display */}
        {planner.error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              padding: 'var(--space-md)',
              background: 'var(--status-danger-dim)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-danger)',
              fontSize: '0.9rem',
              marginBottom: 'var(--space-md)',
            }}
          >
            {planner.error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={planner.isLoading}
          aria-label={planner.isLoading ? 'Generating your event plan...' : 'Generate event plan'}
          style={{ width: '100%' }}
        >
          {planner.isLoading ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} aria-hidden="true" />
              Creating Your Plan...
            </>
          ) : (
            <>✨ Generate Plan</>
          )}
        </button>

        {/* Loading Status */}
        {planner.isLoading && (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Our AI is crafting a personalized plan for your {planner.eventType}...
          </div>
        )}
      </fieldset>
    </form>
  );
}
