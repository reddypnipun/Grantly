# DESIGN SYSTEM

## Direction
Warm, trustworthy, optimistic, modern, distinctive. Warm cream backgrounds, confident coral primary, deep teal accent, warm stone neutrals (never cold gray). Serif display headings for warmth + personality; clean sans body.

## Color tokens (CSS vars, light/dark)
- `--primary`: #F97316 (coral-orange) — confident, optimistic
- `--primary-foreground`: #FFFFFF
- `--accent`: #0D9488 (teal) — trust, calm
- `--success`: #16A34A
- `--warning`: #D97706
- `--danger`: #DC2626
- `--background`: #FBF7F2 (cream) / dark #1C1917
- `--foreground`: #292524 (stone-800) / dark #FAFAF9
- `--muted`: #F5F0E8 / dark #292524
- `--muted-foreground`: #78716C (stone-500)
- `--card`: #FFFFFF / dark #292524
- `--border`: #E7E5E4 (stone-200) / dark #44403C
- `--ring`: primary

## Typography
- Display: Fraunces (serif) — headings, hero
- Body: Manrope (sans) — UI, body
- Scale: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60 (px)

## Spacing / radius / shadow
- Spacing base 4px (Tailwind default)
- Radius: sm 6px, md 10px, lg 14px, xl 20px, full 9999
- Shadow sm: 0 1px 2px rgba(28,25,23,.06); md: 0 4px 12px rgba(28,25,23,.08); lg: 0 12px 32px rgba(28,25,23,.12)

## Layout
- Mobile (<768): bottom nav (5 tabs), single column
- Desktop (>=768): left sidebar (240px) + content
- Max content width 1280px

## Motion
- Framer Motion subtle: fade/slide 200ms, score ring 800ms ease-out, confetti on Won.
- Respect `prefers-reduced-motion`: disable non-essential animation.

## Accessibility
- Semantic HTML, skip-to-content link, visible focus ring (2px primary), ARIA labels, contrast AA (checked), full keyboard nav, alt text, announced errors.
