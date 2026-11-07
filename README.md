# Grantly — your scholarship co-pilot

> Tell us about yourself once. We tell you exactly which scholarships you can win, why, what's missing, and what to do next.

## Problem
Accessing educational financial assistance is a complicated journey: finding opportunities, understanding eligibility, tracking deadlines, repeating applications, and seeing progress.

## Solution
Grantly is a frontend-only scholarship co-pilot covering DISCOVER → UNDERSTAND → DECIDE → APPLY → TRACK → WIN.

## PROBLEM STATEMENT ALIGNMENT

| Brief pain point | Grantly feature |
|---|---|
| Discovery is scattered and noisy | One personalized, ranked feed (Discover Opportunities) |
| Eligibility is confusing | Eligibility Matcher: "Why you qualify" / "What's missing" on every scholarship |
| Deadlines and requirements easy to miss | Unified calendar, reminders, per-scholarship checklists (Manage Applications) |
| Applications are repetitive | Reusable document & essay vault (Document Vault) |
| Nothing shows progress or next steps | Dashboard with one clear "Next best action" |
1. Discovery scattered/noisy → one personalized, ranked feed (Discover).
2. Eligibility confusing → plain-language Why you match / Needs attention / Not eligible (Detail).
3. Deadlines missed → unified calendar, reminders, per-scholarship checklists (Tracker, Calendar).
4. Applications repetitive → reusable document & essay vault (Vault).
5. No progress visibility → dashboard with one clear Next best action (Dashboard).

## Features
- Landing page with hero, how-it-works, animated preview
- Conversational onboarding (<90s) with sample student
- Smart matching engine (pure TS, weighted, explainable) with 18 unit tests
- Discover: ranked feed, search, filters, NL search, sort, save, compare
- Scholarship detail with trust panel
- Application tracker (Kanban + list, DnD + keyboard, Move-to menu)
- Calendar (month + agenda, urgency colors, .ics export) + notification center (7/3/1 days)
- Document & essay vault (statuses, file picker metadata, outline generator, reuse suggestions)
- Dashboard (greeting, funding, closing this week, next best action, stats, deadlines)
- Wow: What-if simulator, Funding goal tracker

## Tech stack
Next.js 16 (App Router), TypeScript (strict), Tailwind CSS 4, shadcn/ui-style components, Framer Motion, Lucide, Zustand, Zod-ready, Vitest, dnd-kit, next/font (Fraunces + Manrope).

## Architecture
Frontend-only. State in Zustand with localStorage persistence behind a storage abstraction (`src/lib/storage`). Matching engine is pure (`src/lib/matching`).

## How to run
```bash
npm install
npm run dev
```
Open http://localhost:3000.

Tests: `npm run test`. Build: `npm run build`.

## Sample data disclaimer
All scholarship records are sample data for demonstration only. They are not verified real opportunities. Official links point to example.com.

## AI assistance disclosure
Built with AI assistance (code generation) as permitted by the event.

## Roadmap
- Real backend integration via storage abstraction
- LLM-enhanced outline generator (optional env key)
- Hindi/English toggle, voice search, Scholarship Passport (stretch)
