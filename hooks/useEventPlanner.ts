/* ═══════════════════════════════════════════════════════════════
   Velora — Event Planning Hook
   Manages state for the event plan form and API interaction.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState, useCallback } from 'react';
import type {
  EventType,
  EventPlanRequest,
  EventPlan,
} from '@/types/event';

interface UseEventPlannerState {
  readonly eventType: EventType;
  readonly guestCount: string;
  readonly budget: string;
  readonly date: string;
  readonly location: string;
  readonly description: string;
  readonly preferences: string;
  readonly plan: EventPlan | null;
  readonly isLoading: boolean;
  readonly error: string;
  readonly model: string;
  readonly complexity: string;
}

interface UseEventPlannerActions {
  readonly setEventType: (type: EventType) => void;
  readonly setGuestCount: (count: string) => void;
  readonly setBudget: (budget: string) => void;
  readonly setDate: (date: string) => void;
  readonly setLocation: (location: string) => void;
  readonly setDescription: (description: string) => void;
  readonly setPreferences: (prefs: string) => void;
  readonly generatePlan: () => Promise<void>;
  readonly resetPlan: () => void;
}

export type UseEventPlannerReturn = UseEventPlannerState & UseEventPlannerActions;

export function useEventPlanner(): UseEventPlannerReturn {
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [preferences, setPreferences] = useState('');
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('');
  const [complexity, setComplexity] = useState('');

  const generatePlan = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setPlan(null);

    try {
      const requestBody: EventPlanRequest = {
        eventType,
        guestCount: parseInt(guestCount, 10) || 50,
        budget: parseFloat(budget) || 5000,
        date: date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
        location: location || 'Not specified',
        description,
        preferences: preferences
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0),
      };

      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? `Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        plan: EventPlan;
        model: string;
        classification: { complexity: string };
      };

      setPlan(data.plan);
      setModel(data.model);
      setComplexity(data.classification.complexity);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [eventType, guestCount, budget, date, location, description, preferences]);

  const resetPlan = useCallback(() => {
    setPlan(null);
    setError('');
    setModel('');
    setComplexity('');
  }, []);

  return {
    eventType,
    guestCount,
    budget,
    date,
    location,
    description,
    preferences,
    plan,
    isLoading,
    error,
    model,
    complexity,
    setEventType,
    setGuestCount,
    setBudget,
    setDate,
    setLocation,
    setDescription,
    setPreferences,
    generatePlan,
    resetPlan,
  };
}
