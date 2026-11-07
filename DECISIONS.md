# DECISIONS

- 2026: Use Next.js App Router (not Pages) for modern defaults.
- 2026: Warm coral primary + teal accent; warm stone neutrals instead of gray.
- 2026: Fraunces display + Manrope body via next/font/google.
- 2026: Zustand stores hydrate from localStorage abstraction; no SSR state to avoid hydration mismatch (client-only rendering for stateful views).
- 2026: Matching engine pure function in src/lib/matching; no React deps.
- 2026: Sample data labeled "Sample data for demonstration" in footer + README; invented but realistic.
- 2026: No real backend; storage abstraction allows future swap.
- 2026: Onboarding collects optional background category clearly labeled for matching only.
- 2026: Dynamic deadlines generated relative to now (1-6 months) so demo never stale.
- 2026: Node 26 environment; pin Next to a version compatible (will verify build).
