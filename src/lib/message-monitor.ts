/**
 * Client-side message monitoring for off-platform payment circumvention detection.
 *
 * Two-tier system:
 * 1. Fast keyword scan (client-side, instant) — catches obvious attempts
 * 2. AI analysis (server-side, async) — catches subtle/contextual attempts
 */

// Keywords and patterns that suggest off-platform payment attempts
const CIRCUMVENTION_PATTERNS: { pattern: RegExp; weight: number; category: string }[] = [
  // Direct payment method mentions
  { pattern: /\bvenmo\b/i, weight: 3, category: 'payment_method' },
  { pattern: /\bzelle\b/i, weight: 3, category: 'payment_method' },
  { pattern: /\bcashapp\b/i, weight: 3, category: 'payment_method' },
  { pattern: /\bcash\s*app\b/i, weight: 3, category: 'payment_method' },
  { pattern: /\bpaypal\b/i, weight: 3, category: 'payment_method' },
  { pattern: /\bwire\s*transfer\b/i, weight: 3, category: 'payment_method' },
  { pattern: /\bbank\s*transfer\b/i, weight: 3, category: 'payment_method' },
  { pattern: /\bdirect\s*deposit\b/i, weight: 3, category: 'payment_method' },
  { pattern: /\bcrypto\b/i, weight: 2, category: 'payment_method' },
  { pattern: /\bbitcoin\b/i, weight: 2, category: 'payment_method' },

  // Off-platform solicitation
  { pattern: /\bpay\s*(me|us)\s*direct(ly)?\b/i, weight: 4, category: 'solicitation' },
  { pattern: /\boutside\s*(the\s*)?(app|platform)\b/i, weight: 4, category: 'solicitation' },
  { pattern: /\boff[\s-]?platform\b/i, weight: 4, category: 'solicitation' },
  { pattern: /\bskip\s*(the\s*)?(fee|commission|platform)\b/i, weight: 5, category: 'solicitation' },
  { pattern: /\bavoid\s*(the\s*)?(fee|commission|platform)\b/i, weight: 5, category: 'solicitation' },
  { pattern: /\bsave\s*(on\s*)?(the\s*)?(fee|commission)\b/i, weight: 4, category: 'solicitation' },
  { pattern: /\bbook\s*direct(ly)?\b/i, weight: 3, category: 'solicitation' },
  { pattern: /\bcut\s*out\s*(the\s*)?middleman\b/i, weight: 5, category: 'solicitation' },
  { pattern: /\bdon'?t\s*(need|use)\s*(the\s*)?(app|platform)\b/i, weight: 4, category: 'solicitation' },

  // Contact info sharing (potential precursor to off-platform dealing)
  { pattern: /\b(my|send\s*(me|to))\s*(personal\s*)?(email|phone|number|cell|whatsapp|telegram|signal)\b/i, weight: 2, category: 'contact_sharing' },
  { pattern: /\btext\s*me\s*(at|on)\b/i, weight: 2, category: 'contact_sharing' },
  { pattern: /\bcall\s*me\s*(at|on)\b/i, weight: 1, category: 'contact_sharing' },

  // Account/routing number sharing
  { pattern: /\b(account|routing)\s*number\b/i, weight: 4, category: 'financial_info' },
  { pattern: /\biban\b/i, weight: 3, category: 'financial_info' },
  { pattern: /\bswift\s*code\b/i, weight: 3, category: 'financial_info' },
];

// Threshold for flagging (sum of matched pattern weights)
const FLAG_THRESHOLD = 3;
const WARN_THRESHOLD = 2;

export interface MessageScanResult {
  /** Whether this message should be flagged for review */
  isFlagged: boolean;
  /** Whether to show a soft warning to the sender */
  showWarning: boolean;
  /** Risk score (sum of matched pattern weights) */
  riskScore: number;
  /** Matched categories */
  matchedCategories: string[];
  /** Human-readable reasons */
  reasons: string[];
}

/**
 * Scans a message for off-platform payment circumvention patterns.
 * Fast, synchronous, runs client-side before message is sent.
 */
export function scanMessage(text: string): MessageScanResult {
  const matches: { category: string; weight: number }[] = [];

  for (const { pattern, weight, category } of CIRCUMVENTION_PATTERNS) {
    if (pattern.test(text)) {
      matches.push({ category, weight });
    }
  }

  const riskScore = matches.reduce((sum, m) => sum + m.weight, 0);
  const matchedCategories = [...new Set(matches.map(m => m.category))];

  const reasons: string[] = [];
  if (matchedCategories.includes('payment_method')) {
    reasons.push('Message mentions an off-platform payment method');
  }
  if (matchedCategories.includes('solicitation')) {
    reasons.push('Message appears to solicit off-platform payment');
  }
  if (matchedCategories.includes('contact_sharing')) {
    reasons.push('Message shares personal contact information');
  }
  if (matchedCategories.includes('financial_info')) {
    reasons.push('Message contains financial account information');
  }

  return {
    isFlagged: riskScore >= FLAG_THRESHOLD,
    showWarning: riskScore >= WARN_THRESHOLD,
    riskScore,
    matchedCategories,
    reasons,
  };
}

/**
 * The deterrence message shown to users when circumvention is detected.
 */
export const CIRCUMVENTION_WARNING =
  'All bookings on HighVibe must be processed through the platform to protect both parties. ' +
  'Off-platform payment arrangements violate our Terms of Service and Provider Agreement, ' +
  'and may result in account suspension. If you have questions about payments, please contact support.';

/**
 * Softer warning for contact-sharing (not necessarily malicious).
 */
export const CONTACT_SHARING_NOTICE =
  'For your protection, we recommend keeping all communication on the HighVibe platform ' +
  'until a booking is confirmed. Sharing personal contact information before a confirmed booking ' +
  'is not recommended.';
