# HighVibe Retreats — Launch Checklist

This is a running checklist of everything needed to go from current state to a fully functional marketplace. Items are grouped by priority and dependency order.

---

## Legend
- [x] Done
- [~] Partially done (needs finishing)
- [ ] Not started

---

## 1. CORE INFRASTRUCTURE (Must Have)

### Auth & Accounts
- [x] User signup (email/password) with Firebase Auth
- [x] User profile creation in Firestore (`/users/{uid}`)
- [x] Role selection at signup (guide, host, vendor, seeker)
- [x] Provider Agreement acceptance at signup
- [x] Host Property Risk Rider acceptance at signup
- [x] Seeker Participation Agreement (at checkout)
- [x] Login flow with error handling
- [x] Admin bypass for launch mode
- [x] `useUser` hook with profile + status
- [x] Email verification flow (sends on signup, banner with resend on dashboards)
- [x] Password reset flow (Firebase default action URL, forgot password on login page)
- [x] Profile editing (account/edit page — saves to Firestore with security rule compliance)

### Launch Mode & Waitlist
- [x] Launch mode middleware (restricts routes)
- [x] Waitlist form + API + Firestore storage
- [x] Waitlist email templates (3 variants)
- [x] Founder code system (claiming + email delivery)
- [x] `/how-it-works` deep-dive page
- [x] Duplicate email detection
- [ ] Turn off launch mode (flip `LAUNCH_MODE` env var to `false`)

---

## 2. PROVIDER LISTINGS (Must Have for Launch)

### Guide — Retreat Creation
- [x] Retreat creation form (`/guide/retreats/new`) — full form with zod validation, date pickers, type selector
- [x] Save retreat to Firestore (`/retreats/{retreatId}`) — save as draft or publish
- [x] Retreat editing flow (`/guide/retreats/[id]/edit`) — load, edit, save, delete
- [x] Retreat image upload (Firebase Storage — real uploads with progress, validation)
- [x] Retreat status management (draft/published/paused) — toggle from dashboard or edit page
- [x] AI retreat description generator (wired to create + edit forms with "Generate with AI" button)
- [x] AI itinerary planner (functional)

### Host — Space Listing
- [x] Space creation form (`/host/spaces/new`) — full form with zod validation, property type, location, amenities
- [x] Save space to Firestore (`/spaces/{spaceId}`) — save as draft or publish
- [x] Space image upload (placeholder component)
- [x] Space editing flow (`/host/spaces/[id]/edit`) — load, edit, save, delete
- [x] **Availability calendar** (blocked-dates calendar on create + edit forms, saves to Firestore)
- [x] **Date-based search** (guides filter spaces by available dates, seekers filter retreats by date range)
- [x] Amenities, capacity, rate per night fields
- [x] Space status management (draft/published/paused) — toggle from dashboard or edit page
- [x] Host dashboard reads spaces from Firestore (with mock data fallback)

### Vendor — Service Listing
- [x] Service creation form (`/vendor/services/new`) — full form with zod validation, category, pricing, service area
- [x] Save service to Firestore (`/services/{serviceId}`) — top-level collection, save as draft or publish
- [x] Service image upload (placeholder component)
- [x] Service editing flow (`/vendor/services/[id]/edit`) — load, edit, save, delete
- [x] Service area / radius configuration
- [x] Pricing tiers (starting price + pricing details text field)
- [x] Service status management (draft/active/paused) — toggle from dashboard or edit page
- [x] Vendor dashboard reads services from Firestore (with mock data fallback)
- [x] Firestore security rules for `/services/{serviceId}` collection

---

## 3. AI MATCHING & DISCOVERY (Core Differentiator)

### Manifestation → AI Matching Pipeline
- [x] Seeker manifestation form (5-step wizard, saves to Firestore)
- [x] Manifestation list view with status tabs
- [x] **AI matching flow**: Analyze manifestation → score against provider profiles → rank matches
- [x] **Notification system**: Alert matched providers about new manifestation
- [x] **Proposal system**: Providers respond to manifestations with retreat proposals
- [x] Match results page for seeker (show top-matched guides, hosts, vendors)
- [x] Conversation initiation from match results

### Partnership Matching (Provider ↔ Provider)
- [x] Guide dashboard: Browse hosts/vendors with filters (real Firestore + mock fallback)
- [x] Host dashboard: Browse guides/vendors with filters (real Firestore + mock fallback)
- [x] Vendor dashboard: Browse guides/hosts with filters (real Firestore + mock fallback)
- [x] Shared `firestore-partners.ts` utility — queries `/users` by role, maps to card interfaces
- [x] Connection/invite system (all dashboards create Firestore connections + conversations)
- [x] Replace mock provider data with real Firestore queries (all 3 dashboards)
- [x] Connection status tracking in Firestore (not just local state)
- [x] Filtering by availability dates (guide dashboard checks space blockedDates)

### Scout Local Vendors (AI-Powered Vendor Acquisition)
- [x] Genkit AI flow — Google Places API search + Gemini relevance scoring
- [x] Email extraction from vendor websites (no email = no contact)
- [x] CAN-SPAM compliant outreach email system via Resend
- [x] Scout UI component on guide dashboard
- [x] Outreach logging to Firestore (`/scout_outreach` collection)
- [x] Provider Agreement Section 10a: Contact Info & Partner Privacy
- [x] Google Places API key configured (Firebase secret + apphosting.yaml)
- [x] Outreach pipeline dashboard (sent / opened / signed up tracking)
- [x] Custom signup landing page with referral tracking (`/join/vendor?ref=scout`)
- [x] Automated follow-up emails (5-day reminder via cron)

### Search & Discovery
- [x] Seeker retreat search with filters (mock data)
- [x] Seeker discovery shows real Firestore retreats (merged with mock data fallback)
- [x] Location-based search (continent/region dropdown filters against real Firestore data)
- [x] Date-based search (seeker page start/end date pickers filter retreats by date range)
- [x] Budget filtering against real pricing (parsePriceRange filters Firestore + mock data)
- [x] Sort by AI recommendation score

---

## 4. MESSAGING & COMMUNICATION

- [x] Inbox UI with conversation list, search, filters
- [x] Real Firestore conversations — InboxContext loads from Firestore, falls back to mock
- [x] Sending messages persists to Firestore (conversations/{id}/messages subcollection)
- [x] Firestore rules for conversations and messages collections
- [x] Real-time message updates (onSnapshot for conversations and messages)
- [x] Unread count from real data (lastReadAt per user in Firestore, persists across sessions)
- [x] Email notifications for new messages (via `/api/notifications` + Resend, with user preference checks + 5-min cooldown)
- [ ] Push notifications for new messages (requires FCM setup — see notes below)
- [x] AI message suggestions (flow + UI wired in conversation-view.tsx)

---

## 5. PAYMENTS & BILLING (Stripe Integration)

### Stripe Setup
- [x] Create Stripe account for HighVibe (manual — Stripe Dashboard)
- [x] Install Stripe SDK (`stripe`)
- [x] Configure Stripe API keys (env vars + Firebase secrets)
- [x] Set up Stripe webhook endpoint (real, with full event routing)
- [ ] Add `transfer.failed` and `payout.failed` events to Stripe Dashboard webhook endpoint
- [x] Webhook signature verification (`stripe.webhooks.constructEvent`)
- [x] Stripe server singleton + auth helper (`src/lib/stripe.ts`, `src/lib/stripe-auth.ts`)

### Seeker Payments (Stripe Checkout)
- [x] Checkout page UI (redirects to Stripe Checkout)
- [x] Integrate Stripe Checkout session creation (`/api/stripe/create-checkout-session`)
- [x] Handle payment success → booking created via webhook + success page
- [x] Handle payment failure → webhook handler for `payment_intent.payment_failed`
- [x] Calculate real platform fees per line item (from `app.json` plan rates)
- [x] Multi-provider line items (guide + host + vendor in one booking)
- [x] Escrow hold pattern (funds held until retreat start + 24h, non-refundable after start)
- [x] Cancel booking endpoint with refund enforcement (`/api/stripe/cancel-booking`)
- [x] Release payouts endpoint (`/api/stripe/release-payouts`)
- [ ] Set `CRON_SECRET` env var (Firebase secret + apphosting.yaml)
- [ ] Configure daily cron job (Cloud Scheduler) to call `POST /api/stripe/release-payouts`

### Provider Payouts (Stripe Connect)
- [x] Stripe Connect onboarding flow for providers (`/api/stripe/connect-onboard`)
- [x] "Connect Stripe" button on payouts page (functional)
- [x] Payout calculation: destination charges with `application_fee_amount`
- [x] Stripe processing fees passed to providers (deducted from their portion)
- [x] Payout history page (`/payouts` — real Stripe transfer data)
- [x] Provider agreement + terms updated with fee transparency (Sections 8 & 6)
- [x] Handle payout failures

### Subscription Billing (Stripe Billing)
- [x] Billing page UI wired to Stripe APIs (plan selection, invoices, payment method)
- [x] Create Stripe Products/Prices for each plan tier (manual — Stripe Dashboard)
- [x] Subscription creation on plan selection (`/api/stripe/create-subscription`)
- [x] Plan upgrade/downgrade logic via Stripe (`/api/stripe/cancel-subscription`)
- [x] 90-day Pro commitment enforcement (with downgrade window tracking)
- [x] $99 reactivation fee logic (within 60-day window)
- [x] Webhook handling for subscription events (created/updated/deleted + invoice events)
- [x] Invoice history from Stripe (`/api/stripe/invoices`)
- [x] Billing portal for payment method management (`/api/stripe/billing-portal`)

### Manifest Credits
- [x] Credit application at checkout (reads from Firestore, applies as Stripe discount)
- [x] **Credit issuance**: After booking completes, create credit doc (3% of amount, capped $500)
- [x] Credit expiry filtering (expired credits rejected at checkout + filtered on billing page)
- [x] Credit balance display on billing page (real Firestore data, total balance + expiry)
- [x] Prevent double-redemption (reserved → redeemed flow, expiry check)

---

## 6. CHARGEBACKS & DISPUTES

- [x] Stripe webhook handler for `charge.dispute.created/updated/closed`
- [x] Chargeback email notification template (exists)
- [x] Admin chargeback page (real Firestore queries, not mock data)
- [x] Real Stripe webhook integration (dispute events create/update booking records)
- [x] Provider evidence submission flow (`/account/disputes`)
- [x] Chargeback offset against future payouts (in `release-payouts` endpoint)
- [x] Dispute resolution tracking (admin page with Active/Resolved tabs)

---

## 7. MOCK DATA TRANSITION PLAN

### Remove at Launch
- [~] `src/lib/mock-data.ts` — replace all references with Firestore queries
  - [x] `allRetreats` → seeker page queries `/retreats` where status=='published', merged with mock fallback
  - [x] `yourRetreats` → guide dashboard queries retreats where `hostId == currentUser.uid`
  - [x] `hostSpaces` → host dashboard queries `/spaces` where `spaceOwnerId == currentUser.uid`
  - [x] `yourServices` → vendor dashboard queries `/services` where `vendorId == currentUser.uid`
  - [x] `matchingGuides*` → query `/users` where role includes 'guide' (via firestore-partners.ts)
  - [x] `hosts` for guide/vendor matching → query `/users` where role includes 'host'
  - [x] `vendors` for matching → query `/users` where role includes 'vendor'
- [x] `src/lib/inbox-data.ts` — InboxContext loads real conversations from Firestore (mock fallback)
- [x] Remove mock connection requests / confirmed bookings from dashboards

### Keep for Development
- [x] Add `NEXT_PUBLIC_USE_MOCK_DATA` feature flag (in `firebase/config.ts`, exports `useMockData`)
- [x] When flag is on, use mock data (for local dev without Firebase)
- [x] When flag is off (production), use real Firestore data

---

## 8. ONBOARDING COMPLETION

### Guide Onboarding
- [x] Choice page (voice vs classic)
- [x] Voice onboarding (speech → AI extracts profile → review → save to Firestore)
- [x] Classic onboarding (3-step wizard: basics → specialties → photos & location)
- [x] Profile completion wizard (guided form for bio, specialties, photos, etc.)

### Host Onboarding
- [x] Choice page (voice vs classic) — just restored
- [x] Voice onboarding (speech → AI extracts host profile → review → save)
- [x] Classic onboarding (3-step wizard: basics → property details → photos & location)
- [x] Space listing wizard (property details, photos, amenities, pricing, availability)

### Vendor Onboarding
- [x] Choice page (voice vs classic)
- [x] Voice onboarding (speech → AI extracts vendor profile → review → save)
- [x] Classic onboarding (3-step wizard: basics → services → photos & links)
- [x] Service listing wizard (service details, pricing, availability, service area)

---

## 9. ADMIN TOOLS

- [x] Admin waitlist management (`/admin/waitlist`)
- [x] Admin contact submissions (`/admin/contact`)
- [x] Admin founder codes (`/admin/founder-codes`)
- [x] Admin chargebacks (`/admin/chargebacks`) — real Firestore data
- [x] Admin user management (`/admin/users` — list + detail + search/filter/export + `/admin/users/[uid]` detail page)
- [x] Admin booking/transaction overview (`/admin/bookings` — real Firestore data with pagination)
- [x] Admin revenue dashboard (revenue cards + monthly chart on `/admin/analytics`)
- [x] Admin content moderation (review listings before publishing)

---

## 10. PRE-LAUNCH POLISH

- [x] Favicon (brand arches)
- [x] SEO metadata
- [x] Error boundaries (root, app, and global-error fallbacks)
- [x] 404 page styling (branded not-found page with header/footer)
- [x] Loading states audit (timeouts on all auth-guarded layouts)
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (ARIA labels, keyboard navigation)
- [ ] Performance audit (bundle size, image optimization)
- [x] Security audit (Firestore rules — bookings server-only, manifest_credits locked, contact_submissions added, input sanitization via zod)
- [x] Terms of Service page content review (updated with fee transparency, Section 6)
- [x] Privacy Policy page content review (added Stripe Connect, AI/Genkit, service provider details)
- [x] Contact/support form (Firestore rule added for contact_submissions, form writes + admin reads)

---


## Suggested Implementation Order

1. **Provider listing creation** (guide retreats, host spaces, vendor services) — the marketplace needs real content
2. **Host availability calendar** — critical for the booking flow to work
3. **Replace mock data with Firestore queries** — transition dashboards to real data
4. **Real messaging** — replace inbox mock data with Firestore conversations
5. **Stripe Checkout** — enable seeker payments
6. **Stripe Connect** — enable provider payouts
7. **AI matching pipeline** — connect manifestations to provider matching
8. **Subscription billing** — enable provider plan upgrades
9. **Manifest credit issuance** — complete the credit loop
10. **Onboarding wizards** — help providers build great profiles/listings
