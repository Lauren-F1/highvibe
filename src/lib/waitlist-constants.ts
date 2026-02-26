// Centralized copy constants for waitlist flow
// Used by: waitlist-modal, waitlist-form, home-page-client, waitlist-email-templates

export type RoleBucket = 'seeker' | 'guide' | 'host' | 'vendor';

// --- Success & Error Messages ---
export const SUCCESS_MESSAGE = "Success — you're on the list.";
export const DUPLICATE_MESSAGE = "Looks like you're already on the list.";

// --- What Happens Next (shared between UI success state + emails) ---
export const NEXT_STEPS = [
  "We'll email you updates as we get closer to launch.",
  "You'll get early access before HighVibe opens publicly.",
  "We'll share a few details ahead of time so your experience is smooth on day one.",
] as const;

// --- Founder Perk Copy (role-specific) ---
export const FOUNDER_PERK_BY_ROLE: Record<RoleBucket, string> = {
  guide: 'Founder Perk: First 100 Guides get 60 days of membership free.',
  host: 'Founder Perk: First 100 Hosts get 60 days of membership free.',
  vendor: 'Founder Perk: First 50 Vendors get 60 days of membership free.',
  seeker: 'No fees to use the platform. Early access coming soon.',
};

// --- Homepage ---
export const HOMEPAGE_PERK_TEASER =
  'Early members unlock exclusive founder perks. Spots are limited.';

// --- Disclaimers ---
export const FOUNDER_PERK_DISCLAIMER =
  'Founder perks are limited by role and availability.';

// --- Role mapping helper (form value → bucket) ---
export function formValueToRoleBucket(formValue: string): RoleBucket {
  if (formValue.startsWith('Seeker')) return 'seeker';
  if (formValue.startsWith('Guide')) return 'guide';
  if (formValue.startsWith('Host')) return 'host';
  if (formValue.startsWith('Vendor')) return 'vendor';
  return 'seeker';
}

// --- Role mapping helper (short label → bucket) ---
export function roleLabelToBucket(label: string): RoleBucket {
  const lower = label.toLowerCase();
  if (lower === 'guide') return 'guide';
  if (lower === 'host') return 'host';
  if (lower === 'vendor') return 'vendor';
  return 'seeker';
}
