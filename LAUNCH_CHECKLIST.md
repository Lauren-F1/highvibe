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
- [ ] Email verification flow
- [ ] Password reset flow (UI exists, needs testing)
- [ ] Profile editing (account/edit page exists, needs Firestore save verification)

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
- [ ] Retreat image upload (Firebase Storage)
- [x] Retreat status management (draft/published/paused) — toggle from dashboard or edit page
- [ ] AI retreat description generator (flow exists, not wired to form)
- [x] AI itinerary planner (functional)

### Host — Space Listing
- [x] Space creation form (`/host/spaces/new`) — full form with zod validation, property type, location, amenities
- [x] Save space to Firestore (`/spaces/{spaceId}`) — save as draft or publish
- [x] Space image upload (placeholder component)
- [x] Space editing flow (`/host/spaces/[id]/edit`) — load, edit, save, delete
- [ ] **Availability calendar** (Airbnb-style date picker for hosts to set available dates)
- [ ] **Date-based search** (guides filter spaces by available dates)
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
- [ ] **AI matching flow**: Analyze manifestation → score against provider profiles → rank matches
- [ ] **Notification system**: Alert matched providers about new manifestation
- [ ] **Proposal system**: Providers respond to manifestations with retreat proposals
- [ ] Match results page for seeker (show top-matched guides, hosts, vendors)
- [ ] Conversation initiation from match results

### Partnership Matching (Provider ↔ Provider)
- [x] Guide dashboard: Browse hosts/vendors with filters (real Firestore + mock fallback)
- [x] Host dashboard: Browse guides/vendors with filters (real Firestore + mock fallback)
- [x] Vendor dashboard: Browse guides/hosts with filters (real Firestore + mock fallback)
- [x] Shared `firestore-partners.ts` utility — queries `/users` by role, maps to card interfaces
- [~] Connection/invite system (host→guide creates real Firestore conversation; others are local state)
- [x] Replace mock provider data with real Firestore queries (all 3 dashboards)
- [ ] Connection status tracking in Firestore (not just local state)
- [ ] Filtering by availability dates (once host calendar is built)

### Scout Local Vendors (AI-Powered Vendor Acquisition)
- [x] Genkit AI flow — Google Places API search + Gemini relevance scoring
- [x] Email extraction from vendor websites (no email = no contact)
- [x] CAN-SPAM compliant outreach email system via Resend
- [x] Scout UI component on guide dashboard
- [x] Outreach logging to Firestore (`/scout_outreach` collection)
- [x] Provider Agreement Section 10a: Contact Info & Partner Privacy
- [x] Google Places API key configured (Firebase secret + apphosting.yaml)
- [ ] Outreach pipeline dashboard (sent / opened / signed up tracking)
- [ ] Custom signup landing page with referral tracking (`/join/vendor?ref=scout`)
- [ ] Automated follow-up emails (5-day reminder)

### Search & Discovery
- [x] Seeker retreat search with filters (mock data)
- [x] Seeker discovery shows real Firestore retreats (merged with mock data fallback)
- [ ] Location-based search (by region/destination)
- [ ] Date-based search
- [ ] Budget filtering against real pricing
- [ ] Sort by AI recommendation score

---

## 4. MESSAGING & COMMUNICATION

- [x] Inbox UI with conversation list, search, filters
- [x] Real Firestore conversations — InboxContext loads from Firestore, falls back to mock
- [x] Sending messages persists to Firestore (conversations/{id}/messages subcollection)
- [x] Firestore rules for conversations and messages collections
- [ ] Real-time message updates (currently loads on page open, not live)
- [ ] Unread count from real data (currently all marked unread)
- [ ] Push/email notifications for new messages
- [ ] AI message suggestions (flow exists, not wired to UI)

---

## 5. PAYMENTS & BILLING (Stripe Integration)

### Stripe Setup
- [ ] Create Stripe account for HighVibe
- [ ] Install Stripe SDK (`stripe` + `@stripe/stripe-js`)
- [ ] Configure Stripe API keys (env vars + Firebase secrets)
- [ ] Set up Stripe webhook endpoint (real, not mock)
- [ ] Webhook signature verification

### Seeker Payments (Stripe Checkout)
- [~] Checkout page UI (exists, creates Firestore booking, but no Stripe payment)
- [ ] Integrate Stripe Checkout session creation
- [ ] Handle payment success → confirm booking
- [ ] Handle payment failure → show error
- [ ] Calculate real platform fees per line item (currently hardcoded to $0)
- [ ] Multi-provider line items (guide + host + vendor in one booking)

### Provider Payouts (Stripe Connect)
- [ ] Stripe Connect onboarding flow for providers
- [ ] "Connect Stripe" button on billing page (currently placeholder)
- [ ] Payout calculation: booking amount - platform fee - Stripe processing fee
- [ ] Automatic payout scheduling
- [ ] Payout history page (currently placeholder at `/payouts`)
- [ ] Handle payout failures

### Subscription Billing (Stripe Billing)
- [~] Billing page UI with plan selection + guardrails (exists, local state only)
- [ ] Create Stripe Products/Prices for each plan tier
- [ ] Subscription creation on plan selection
- [ ] Plan upgrade/downgrade logic via Stripe
- [ ] 90-day Pro commitment enforcement
- [ ] $99 reactivation fee logic
- [ ] Webhook handling for subscription events (renewal, cancellation, failure)
- [ ] Invoice history from Stripe (currently mock)

### Manifest Credits
- [~] Credit application at checkout (reads from Firestore, applies discount)
- [ ] **Credit issuance**: After booking completes, create credit doc (3% of amount, capped $500)
- [ ] Credit expiry job (mark expired after 365 days)
- [ ] Credit balance display on billing page (currently shows mock data)
- [ ] Prevent double-redemption

---

## 6. CHARGEBACKS & DISPUTES

- [~] Stripe webhook handler for `charge.dispute.created` (mock data)
- [~] Chargeback email notification template (exists)
- [~] Admin chargeback page (mock data)
- [ ] Real Stripe webhook integration
- [ ] Provider evidence submission flow
- [ ] Chargeback offset against future payouts
- [ ] Dispute resolution tracking

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
- [ ] Remove mock connection requests / confirmed bookings from dashboards

### Keep for Development
- [ ] Add `NEXT_PUBLIC_USE_MOCK_DATA` feature flag
- [ ] When flag is on, use mock data (for local dev without Firebase)
- [ ] When flag is off (production), use real Firestore data

---

## 8. ONBOARDING COMPLETION

### Guide Onboarding
- [x] Choice page (voice vs classic)
- [~] Voice onboarding (page exists, functionality TBD)
- [~] Classic onboarding (placeholder "Coming Soon")
- [ ] Profile completion wizard (guided form for bio, specialties, photos, etc.)

### Host Onboarding
- [x] Choice page (voice vs classic) — just restored
- [~] Voice onboarding (placeholder)
- [~] Classic onboarding (placeholder)
- [ ] Space listing wizard (property details, photos, amenities, pricing, availability)

### Vendor Onboarding
- [x] Choice page (voice vs classic)
- [~] Voice onboarding (page exists)
- [~] Classic onboarding (placeholder)
- [ ] Service listing wizard (service details, pricing, availability, service area)

---

## 9. ADMIN TOOLS

- [x] Admin waitlist management (`/admin/waitlist`)
- [x] Admin contact submissions (`/admin/contact`)
- [x] Admin founder codes (`/admin/founder-codes`)
- [~] Admin chargebacks (`/admin/chargebacks`) — mock data
- [ ] Admin user management (view/edit/suspend users)
- [ ] Admin booking/transaction overview
- [ ] Admin revenue dashboard
- [ ] Admin content moderation (review listings before publishing)

---

## 10. PRE-LAUNCH POLISH

- [x] Favicon (brand arches)
- [x] SEO metadata
- [ ] Error boundaries (global fallback for crashes)
- [ ] 404 page styling
- [ ] Loading states audit (ensure no infinite spinners)
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (ARIA labels, keyboard navigation)
- [ ] Performance audit (bundle size, image optimization)
- [ ] Security audit (Firestore rules, API routes, input sanitization)
- [ ] Terms of Service page content review
- [ ] Privacy Policy page content review
- [ ] Contact/support form testing

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
