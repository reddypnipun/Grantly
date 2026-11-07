# PLAN

## Stack
Next.js 15 (App Router) + TS strict + Tailwind + shadcn/ui + Framer Motion + Lucide + Zustand + Zod + Vitest + dnd-kit + next/font.

## Routes
- `/` landing
- `/onboarding` conversational onboarding
- `/dashboard` home after onboarding
- `/discover` ranked feed
- `/scholarships/[id]` detail
- `/tracker` kanban + list
- `/calendar` month + agenda
- `/vault` documents + essays
- `/what-if` simulator
- `/goals` funding goal tracker

## Feature folders
- `src/types` — Scholarship, StudentProfile, Application, Document, Essay, Reminder
- `src/data/scholarships.seed.ts` — 40+ records, dynamic deadlines
- `src/lib/storage` — storage abstraction (localStorage)
- `src/lib/matching` — pure engine + tests
- `src/lib/search` — NL parser
- `src/lib/ics`, `src/lib/outline`, `src/lib/reuse`
- `src/stores` — zustand stores
- `src/components` — shared + layout + ui (shadcn)
- `src/app` — routes

## Data flow
Profile + applications + vault persist via storage abstraction (localStorage). Matching engine is pure: takes profile + scholarships, returns scored list. Stores hydrate from storage on mount.

## Non-goals
No backend, no real auth, no real LLM (offline templates only).
