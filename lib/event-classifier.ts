/* ═══════════════════════════════════════════════════════════════
   Velora — Event Query Classifier
   Heuristic pre-filter to route queries to the optimal model.
   ═══════════════════════════════════════════════════════════════ */

import type { ClassificationResult, EventType, QueryComplexity, GroqModel } from '@/types/event';

/** Complex query indicators — topics requiring deep reasoning */
const COMPLEX_PATTERNS: ReadonlyArray<RegExp> = [
  /budget\s*(breakdown|allocat|distribut|optimiz)/i,
  /vendor\s*(comparison|negoti|contract|select)/i,
  /timeline\s*(creat|build|plan|organiz|schedul)/i,
  /multi[- ]?day/i,
  /destination\s*(wedding|event)/i,
  /\d{3,}\s*guests?/i,
  /custom(ize|ise|ization)/i,
  /cultur(al|e)\s*(theme|tradition|fusion)/i,
  /sustainability|eco[- ]?friendly|green\s*event/i,
  /accessibility\s*(requirements?|needs?|accommodat)/i,
  /legal\s*(requirements?|permits?|licen[sc])/i,
  /insurance|liability/i,
  /contingency|backup\s*plan|rain\s*plan/i,
  /full\s*(plan|event\s*plan|comprehensive)/i,
  /seating\s*(chart|arrangement|plan)/i,
  /menu\s*(planning|design|tasting)/i,
  /entertainment\s*(lineup|schedul|booking)/i,
  /logistics|coordination|management/i,
  /\d{2,}\s*vendors?/i,
  /theme\s*(design|concept|creat)/i,
];

/** Simple query indicators — fast, factual responses */
const SIMPLE_PATTERNS: ReadonlyArray<RegExp> = [
  /^(what|how\s+much|when|where|who|which)\b/i,
  /^(is|are|can|do|does|should)\b/i,
  /recommend(ation)?s?\b/i,
  /suggest(ion)?s?\b/i,
  /idea(s)?\s*(for|about)/i,
  /tip(s)?\s*(for|about|on)/i,
  /average\s*(cost|price)/i,
  /how\s+to\s+(find|choose|pick|select)/i,
  /best\s+(time|season|day|month)/i,
  /difference\s+between/i,
  /check\s*list/i,
  /thank/i,
  /hello|hi|hey/i,
];

/** Event type detection patterns */
const EVENT_TYPE_PATTERNS: ReadonlyArray<{ pattern: RegExp; type: EventType }> = [
  { pattern: /wedding|bridal|groom|bride|nuptial|engagement|reception|honeymoon/i, type: 'wedding' },
  { pattern: /birthday|bday|b-day|anniversary|milestone\s*age|turning\s*\d+/i, type: 'birthday' },
  { pattern: /community|fundrais|charity|corporate|conference|meetup|festival|fair|gala/i, type: 'community' },
];

/** Category detection patterns for context enrichment */
const CATEGORY_PATTERNS: ReadonlyArray<{ pattern: RegExp; category: string }> = [
  { pattern: /venue|location|hall|garden|beach|barn|hotel/i, category: 'venue' },
  { pattern: /cater(ing|er)|food|menu|cuisine|chef|meal/i, category: 'catering' },
  { pattern: /photo(graph|s)|camera|portrait|shots/i, category: 'photography' },
  { pattern: /video(graph)?|film|cinema|drone/i, category: 'videography' },
  { pattern: /music|band|dj|playlist|live\s*(music|band)/i, category: 'music' },
  { pattern: /decor(ation)?|theme|color\s*scheme|centerpiece|flower/i, category: 'decor' },
  { pattern: /flor(ist|al)|bouquet|arrangement|roses/i, category: 'florist' },
  { pattern: /cake|baker|pastry|dessert|sweet/i, category: 'bakery' },
  { pattern: /dress|suit|attire|outfit|tuxedo|gown/i, category: 'attire' },
  { pattern: /invit(ation|e)|stationer|rsvp|save[- ]the[- ]date/i, category: 'stationery' },
  { pattern: /transport|limo|car|shuttle|ride/i, category: 'transport' },
  { pattern: /makeup|hair|beauty|stylist|spa/i, category: 'beauty' },
  { pattern: /entertain(ment|er)|game|activit|magic|comedian/i, category: 'entertainment' },
  { pattern: /rental|tent|table|chair|linen/i, category: 'rental' },
  { pattern: /coordinat|planner|organiz|manage/i, category: 'coordination' },
  { pattern: /budget|cost|price|expense|afford|cheap|expensive/i, category: 'budget' },
  { pattern: /timeline|schedule|countdown|deadline|milestone/i, category: 'timeline' },
];

/** Estimate token count from text length */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Maximum token context for a single request */
const MAX_CONTEXT_TOKENS = 6000;

/**
 * Classify an event planning query to determine complexity, model routing,
 * and detected context categories.
 */
export function classifyEventQuery(input: string): ClassificationResult {
  const tokens = estimateTokens(input);

  // Detect event type
  let eventType: EventType | null = null;
  for (const { pattern, type } of EVENT_TYPE_PATTERNS) {
    if (pattern.test(input)) {
      eventType = type;
      break;
    }
  }

  // Detect categories
  const detectedCategories: string[] = [];
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(input)) {
      detectedCategories.push(category);
    }
  }

  // Score complexity
  let complexScore = 0;
  let simpleScore = 0;

  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(input)) {
      complexScore += 1;
    }
  }

  for (const pattern of SIMPLE_PATTERNS) {
    if (pattern.test(input)) {
      simpleScore += 1;
    }
  }

  // Factor in token length — long inputs tend to be complex
  if (tokens > 500) complexScore += 2;
  else if (tokens > 200) complexScore += 1;

  // Factor in category diversity — multi-category = complex
  if (detectedCategories.length >= 4) complexScore += 2;
  else if (detectedCategories.length >= 2) complexScore += 1;

  // Determine complexity level
  let complexity: QueryComplexity;
  if (complexScore >= 3) {
    complexity = 'complex';
  } else if (complexScore >= 1 && simpleScore < complexScore) {
    complexity = 'moderate';
  } else {
    complexity = 'simple';
  }

  // Route to model
  const model: GroqModel =
    complexity === 'complex' || complexity === 'moderate'
      ? 'openai/gpt-oss-120b'
      : 'openai/gpt-oss-20b';

  return {
    complexity,
    model,
    eventType,
    detectedCategories,
    estimatedTokens: tokens,
    requiresChunking: tokens > MAX_CONTEXT_TOKENS,
  };
}
