# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HighVibe Retreats is a Next.js 15 marketplace connecting retreat **seekers**, **guides**, **hosts**, and **vendors**. It uses Firebase (Auth, Firestore) for the backend and is deployed via Firebase App Hosting.

## Commands

- `npm run dev` — Start dev server with Turbopack
- `npm run build` — Production build
- `npm run lint` — ESLint via Next.js
- `npm run typecheck` — TypeScript type checking (`tsc --noEmit`)
- `npm run genkit:dev` — Start Genkit AI dev server
- `npm run genkit:watch` — Start Genkit AI dev server with watch mode

No test framework is configured. Manual testing follows `SMOKE_TEST_CHECKLIST.md`.

## Architecture

### App Router Structure (`src/app/`)

Uses Next.js App Router. The `(app)` route group wraps all authenticated pages with a shared layout and sidebar navigation.

**Role-based dashboards** under `(app)/`:
- `/seeker` — Retreat discovery, saved retreats, manifestations
- `/guide` — Create and manage retreats
- `/host` — Property/space management
- `/vendor` — Service listings
- `/account` — Profile editing (shared across roles)
- `/inbox` — Messaging between users
- `/checkout`, `/payouts`, `/billing` — Payment flows

**Public routes**: `/` (landing), `/join` (onboarding), `/login`, `/signup`, `/u/[slug]` (public profiles)

**Admin routes**: `/admin/waitlist`, `/admin/contact`, `/admin/founder-codes`

**API routes**: `/api/waitlist` (POST), `/api/admin/seed-codes` (POST)

### Launch Mode

Controlled by `LAUNCH_MODE` env var. When active, middleware (`src/middleware.ts`) restricts access to only `/`, `/terms`, `/privacy`, `/login`. Admin bypass via `isAdminBypass` cookie. All other routes redirect to `/`.

### Firebase Integration (`src/firebase/`)

- `config.ts` — Client config from `NEXT_PUBLIC_FIREBASE_*` env vars; exports `isFirebaseEnabled` guard
- `provider.tsx` / `client-provider.tsx` — React context providers for Firebase instances
- `auth/use-user.tsx` — Auth hook providing current user + Firestore profile
- `firestore/use-doc.tsx`, `use-collection.tsx` — Real-time Firestore listener hooks
- `src/lib/firebase-admin.ts` — Server-side Admin SDK (used in API routes)

When Firebase is not configured, the app falls back to mock data and `localStorage` for dev (`devUser`, `devProfile`, `devSavedRetreats` keys).

### Firestore Schema

Defined in `docs/backend.json`. Key collections:
- `/users/{userId}` — User profiles (multi-role, with role-specific fields like `vendorCategories`, `hostAmenities`, `guideRetreatTypes`)
- `/waitlist/{email}` — Waitlist submissions (email as doc ID)
- `/founder_codes/{codeId}` — Gated access codes for founding members
- `/conversations/{id}/messages/{id}` — Messaging
- `/manifestations/{id}` — Seeker dream retreat requests
- `/matches/{id}`, `/proposals/{id}` — Provider matching system
- `/bookings/{id}` — Confirmed bookings with line items and per-provider platform fees

Security rules in `firestore.rules` enforce ownership-based access. Admin operations use `admin` custom claim.

### AI Flows (`src/ai/`)

Uses Google Genkit with Gemini 2.5 Flash (`src/ai/genkit.ts`). Flows:
- `retreat-description-generator.ts` — AI-generated retreat descriptions
- `commission-enforcement.ts` — Detects commission circumvention attempts

### Business Logic (`src/config/app.json`)

Contains subscription plans (pay-as-you-go / starter / pro) per role with different platform fee percentages (2-15%). Also defines manifestation credit rules (3% back, $500 cap).

### UI Stack

- **shadcn/ui** components in `src/components/ui/` (configured in `components.json`)
- **Tailwind CSS** with custom theme: beige/tan base, orange-red "poppy" accent
- **Fonts**: Droid Serif, Cormorant Garamond (elegant, modern)
- **Icons**: Lucide React + custom icons in `src/components/icons/`
- **Forms**: react-hook-form + zod validation

## Key Patterns

- Path alias: `@/*` maps to `src/*`
- Feature toggles: `NEXT_PUBLIC_ENABLE_VENDOR_DISCOVERY`, `NEXT_PUBLIC_ENABLE_GUIDE_DISCOVERY` in `src/firebase/config.ts`
- Email via Resend API (`src/lib/email.ts`)
- Secrets from Google Cloud Secret Manager (`@google-cloud/secret-manager`)
- Build ignores TypeScript and ESLint errors (`next.config.ts`)
- Mock data in `src/lib/mock-data.ts` and `src/lib/inbox-data.ts` for development without Firebase

## Style Guidelines

- Black, white, beige palette with bright orange-red ("poppy") accent color
- Clean lines, lots of white space, upscale and trendy aesthetic
- No animations — static layouts with image placeholders
