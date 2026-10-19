/* ═══════════════════════════════════════════════════════════════
   Velora — TypeScript Interfaces
   All domain types for event planning.
   ═══════════════════════════════════════════════════════════════ */

/** Supported event categories */
export type EventType = 'wedding' | 'birthday' | 'community';

/** Budget tier classification */
export type BudgetTier = 'budget' | 'moderate' | 'premium' | 'luxury';

/** Complexity classification for model routing */
export type QueryComplexity = 'simple' | 'moderate' | 'complex';

/** Groq model identifiers */
export type GroqModel = 'openai/gpt-oss-120b' | 'openai/gpt-oss-20b';

/** Vendor categories for event planning */
export type VendorCategory =
  | 'venue'
  | 'catering'
  | 'photography'
  | 'videography'
  | 'music'
  | 'decor'
  | 'florist'
  | 'bakery'
  | 'attire'
  | 'stationery'
  | 'transport'
  | 'beauty'
  | 'entertainment'
  | 'rental'
  | 'coordination';

/** User-submitted event planning request */
export interface EventPlanRequest {
  readonly eventType: EventType;
  readonly guestCount: number;
  readonly budget: number;
  readonly date: string;
  readonly location: string;
  readonly description: string;
  readonly preferences: ReadonlyArray<string>;
}

/** AI-generated event plan response */
export interface EventPlan {
  readonly summary: string;
  readonly eventType: EventType;
  readonly budgetBreakdown: ReadonlyArray<BudgetItem>;
  readonly timeline: ReadonlyArray<TimelineItem>;
  readonly vendorChecklist: ReadonlyArray<VendorChecklistItem>;
  readonly personalizedIdeas: ReadonlyArray<PersonalizedIdea>;
  readonly tips: ReadonlyArray<string>;
}

/** Budget line item */
export interface BudgetItem {
  readonly category: string;
  readonly estimatedCost: number;
  readonly percentOfTotal: number;
  readonly notes: string;
  readonly priority: 'essential' | 'recommended' | 'optional';
}

/** Timeline milestone */
export interface TimelineItem {
  readonly date: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly completed: boolean;
}

/** Vendor checklist entry */
export interface VendorChecklistItem {
  readonly id: string;
  readonly vendor: string;
  readonly category: VendorCategory;
  readonly description: string;
  readonly estimatedCost: number;
  readonly booked: boolean;
  readonly dueDate: string;
  readonly priority: 'high' | 'medium' | 'low';
}

/** Personalized idea suggestion */
export interface PersonalizedIdea {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly estimatedCost: number;
  readonly difficulty: 'easy' | 'medium' | 'hard';
}

/** Chat message for streaming interface */
export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: number;
  readonly model?: GroqModel;
}

/** Quick question for the AI assistant */
export interface QuickQuestionRequest {
  readonly question: string;
  readonly eventContext?: Partial<EventPlanRequest>;
}

/** SSE streaming request */
export interface StreamRequest {
  readonly messages: ReadonlyArray<{
    readonly role: 'user' | 'assistant';
    readonly content: string;
  }>;
  readonly eventContext?: Partial<EventPlanRequest>;
}

/** Rate limit check result */
export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: number;
  readonly headers: Record<string, string>;
}

/** API usage statistics */
export interface UsageStats {
  readonly totalRequests: number;
  readonly remainingRequests: number;
  readonly resetAt: number;
  readonly windowMs: number;
  readonly endpoint: string;
}

/** Classification result from event classifier */
export interface ClassificationResult {
  readonly complexity: QueryComplexity;
  readonly model: GroqModel;
  readonly eventType: EventType | null;
  readonly detectedCategories: ReadonlyArray<string>;
  readonly estimatedTokens: number;
  readonly requiresChunking: boolean;
}

/** Chunk result from event chunker */
export interface ChunkResult {
  readonly chunks: ReadonlyArray<string>;
  readonly totalTokens: number;
  readonly wasChunked: boolean;
  readonly chunkCount: number;
}

/** API error response shape */
export interface ApiErrorResponse {
  readonly error: string;
  readonly code: string;
  readonly details?: string;
}
