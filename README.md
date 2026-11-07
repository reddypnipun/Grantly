# Grantly — your scholarship co-pilot

> Tell us about yourself once. We tell you exactly which scholarships you can win, why, what's missing, and what to do next.

## The Antidote to a Broken Scholarship System

Accessing educational financial assistance is a complicated journey: finding opportunities scattered across dozens of sites, decoding confusing eligibility rules, chasing deadlines you didn't know existed, re-entering the same documents into every application, and never knowing if you're actually making progress. Students give up not because the money isn't there, but because the journey is exhausting.

**Grantly is the antidote.** It's a student's scholarship co-pilot that covers the entire journey — DISCOVER → UNDERSTAND → DECIDE → APPLY → TRACK → WIN — in one seamless, personalized, mobile-first digital experience. Tell us about yourself once; we tell you exactly which scholarships you can win, why, what's missing, and what to do next.

## 🚀 INNOVATION & "WOW" FEATURES

- **The "What-If" Simulator:** Move sliders and dropdowns (GPA, field, location, need level) and watch your total potential funding and matched scholarships instantly animate and recalculate live. The demo showstopper — students can see how a small GPA bump unlocks new money.
- **Trust & Scam Prevention Panel:** Every scholarship detail page ships an automated Trust Score / Scam Check ("Verified Provider", "No Application Fee Required", "Legit scholarships never ask you to pay a fee"). This uniquely addresses the "complicated journey" in the brief by protecting students from predatory listings.
- **Natural-Language Search:** Type "engineering scholarships for women under 2 hours of effort" and a client-side parser maps phrases to filters — no backend, no API key.
- **Funding Goal Tracker:** "You need X for tuition. You've applied for Y. Expected coverage is Z." with a live progress visualization.
- **Explainable Matching Engine:** A pure, deterministic, unit-tested (18 cases) weighted engine — no black box. Every score comes with "Why you qualify", "Needs attention", and "Not eligible because" in plain language.

## 🎯 PROBLEM ALIGNMENT (How Grantly Solves the Brief)

| Brief pain point | Grantly feature | Impact |
|---|---|---|
| Discovery is scattered and noisy | One personalized, ranked feed (Discover Opportunities) with search, filters, sort, save, and compare | Replaces 20+ scattered sites with a single, ranked, filterable feed tailored to the student |
| Eligibility is confusing | Eligibility Matcher on every detail page: "Why you qualify" (green checks) and "What's missing" (red x's) | Turns opaque criteria into plain-language, actionable guidance so students know exactly where they stand |
| Deadlines and requirements easy to miss | Unified calendar (month + agenda, color-coded urgency), in-app reminders at 7/3/1 days, per-scholarship checklists, downloadable .ics export | Nothing slips through the cracks; every deadline and task is tracked in one place |
| Applications are repetitive | Reusable document & essay vault (Document Vault) with status tracking, file metadata, offline outline generator, and reuse suggestions | Write once, reuse everywhere — cuts application effort dramatically |
| Nothing shows progress or next steps | Dashboard with "Total potential funding you qualify for", "Closing this week", and ONE highlighted "Next best action" plus progress stats | Replaces anxiety with a clear, single next step and visible momentum |

## Features (by user journey)

### 1. Onboarding
- Conversational onboarding (under 90 seconds): one question per screen, progress bar, back and skip
- Collects education level, field, country, GPA/percentage (optional), need level, background (labeled "used only for matching"), interests, goals
- Prominent "Try with a sample student" button jumps straight to a filled demo profile
- Profile persisted and editable later

### 2. Discovery & Matching
- Ranked feed with search, filters (amount, deadline, level, field, location, need/merit, effort), and sort (best match, closing soon, highest amount, lowest effort)
- Natural-language search via client-side parser
- Save/bookmark and compare up to 3 side by side
- Scholarship detail: overview, eligibility breakdown, requirements checklist, key dates, award details, official link, tips
- Trust panel: source badge + scam-awareness tips ("Legit scholarships never ask you to pay a fee")

### 3. Tracking & Organization
- Application tracker: Kanban (Saved → Preparing → Submitted → Awaiting Result → Won / Not selected) with drag-and-drop and keyboard-accessible "Move to…" menu; list/table view toggle; deadline countdowns and checklist progress
- Calendar: month + agenda views, color-coded urgency, notification center (7/3/1 days), .ics export per deadline
- Document & essay vault: common-document checklist (Ready / In progress / Missing) with optional local file picker (name + size), essay workspace with word count vs. limits, offline outline generator and reuse suggestions
- Dashboard: greeting, total potential funding, closing this week, one "Next best action", progress stats (saved / in progress / submitted / won), upcoming deadlines strip
- Wow: "What-If" simulator (sliders/selects update matches and funding live with animation) and Funding Goal Tracker (need X, applied Y, expected coverage Z)

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

## Accessibility
- High-contrast mode toggle, skip-to-content link, keyboard-navigable Kanban, ARIA labels, focus rings, prefers-reduced-motion respected, simplify-text toggle on detail pages.

## Roadmap
- Real backend integration via storage abstraction
- LLM-enhanced outline generator (optional env key)
- Hindi/English toggle, voice search, Scholarship Passport (stretch)