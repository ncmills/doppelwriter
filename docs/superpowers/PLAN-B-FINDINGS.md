# Plan B — findings surfaced during Plan A verification (2026-06-21)

These are real regressions/decisions caused by the rebrand that Plan A intentionally did NOT fix (it scoped out the 27-component refactor). Address in Plan B.

1. **Homepage italic-serif regression (visible).** `src/app/page.tsx` uses `italic` + `font-[family-name:var(--font-display)]` extensively (lines 142, 194, 227, 245, 257, 312, 367, 404 …). The old brand was Playfair (a serif WITH elegant italics); the new display is Space Grotesk (a grotesk with NO italic face). Result: those lines now render as fallback serif-italic — looks broken. DECISION for Plan B: drop the serif-italic accent treatment brand-wide (the modern-grotesk brand doesn't do elegant italics); replace with weight/size/tracking emphasis instead. Confirmed NOT a font-fetch failure (32 woff2 self-hosted, no 400s).

2. **`--color-ink-soft` legacy alias.** Plan A mapped it to a direct warm value `#4a443b` (no raw token equiv). Many components still read `--color-ink-soft`. When page.tsx migrates onto semantic tokens, map these to `--color-fg-muted` (or a new `--color-fg-soft` if a distinct level is wanted).

3. **Reveal-in-Stagger cascade.** `Reveal` uses its own `whileInView` rather than parent `variants`, so inside `Stagger` cards reveal independently, not as a true staggered cascade. If the cascade is wanted, add a variants-driven reveal child.

4. **Brand assets still old:** logo (dw-mark.svg ditto-marks), og-image.png, 4 dynamic opengraph-image routes, HomepageCinematic, MarketingFilm, writer-hero curtain, `.duotone` sepia portrait wash — all still encode the old ivory/ink brand. Plan B redoes these.
