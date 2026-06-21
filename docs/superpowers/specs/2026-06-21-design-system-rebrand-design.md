# DoppelWriter — Rebrand + Design System

**Date:** 2026-06-21
**Status:** Spec — awaiting review
**Owner:** Nick

## Goal

Two things, in order:

1. **Full rebrand** of DoppelWriter from the current literary ivory/ink identity to a **"Modern AI-product, warm"** direction — a sharp, contemporary 2026 AI tool that still reads warm, not cold-corporate.
2. **A real design system** expressing the new brand, surfaced in **three places from one token source**: a canonical `DESIGN-SYSTEM.md`, a live in-app `/style-guide` route, and a browsable component library in the Claude app (claude.ai/design via `/design-sync`).

This is a clean break from ivory/ink, not an evolution. Brand recognition resets; every page's feel is re-checked.

## Context (current state)

- **Stack:** Next.js 16 App Router, Tailwind v4 (`@theme` tokens in `src/app/globals.css`), Neon Postgres, deployed on Vercel (auto-deploy on `git push origin main`).
- **Current tokens** live in `globals.css`: ivory/ink palette, 1.2 modular type scale (`--fs-micro`→`--fs-hero`), 8pt spacing register, helper classes (`.rule`, `.prose`, `.ed-link`, `.type-cursor`, `.duotone`, `.hairline-frame`, hero-curtain + analyze-reveal choreography).
- **Fonts today:** Playfair Display (display) + Inter (sans) + JetBrains Mono (mono) via `next/font/google` in `src/app/layout.tsx`.
- **~87 tsx files; 27 use tokens/buttons inline** (e.g. `bg-[var(--color-paper-deep)]`, `border-[var(--color-rule)]`). No `components/ui/` primitives — buttons/cards/inputs/badges are hand-rolled per component.
- **Brand assets to redo:** `public/logo/dw-mark.svg`, `dw-wordmark.svg`, `public/logo.png`, static `public/og-image.png`, and **4 dynamic OG routes** (`src/app/opengraph-image.tsx` + `write-like/[slug]`, `write/[slug]`, `analyze/[slug]`). The cinematic homepage hero (`HomepageCinematic.tsx`), `MarketingFilm.tsx`, and writer-page hero curtain all encode the old brand.
- **Stale contradiction:** in-repo `CLAUDE.md` "Style" block still describes the *original* dark `#0C0A09`/amber/Literata brand — wrong on two counts now (never matched ivory/ink; about to be wrong again). Will be replaced to point at `DESIGN-SYSTEM.md`.

## Brand direction: "Modern AI-product, warm"

The north star: Linear/Vercel-grade craft, but warm. Reads as a serious, current AI tool — not beige, not cold-blue-corporate (explicitly ruled out per Nick's taste rules).

- **Type:** bold grotesk display + clean sans for body. (Playfair serif retired. Mono kept for demo/code surfaces, possibly swapped.)
- **Color:** warm neutral base + **one** vivid accent. Restrained — color is a scalpel, not a coat of paint.
- **Motion:** precise, quick. Fast transitions, no slow cinematic drifts as the default (the cinematic moments become deliberate accents, not the baseline).
- **Layout:** generous space, confident type scale, crisp hard-or-soft-cornered components (radius decided in Phase 0).

## Phase 0 — Lock the identity (visual round in Claude Design)

The exact palette hexes, accent hue, and font pairing are decisions to **see, not assert**. Before any system code:

1. Generate **2–3 concrete identity options** as self-contained HTML preview cards — each a full token set (palette swatches + accent, display/body font pairing, a sample hero + button + card rendered with those tokens).
2. Push them to a Claude Design System project via `DesignSync` (`list_projects` → reuse or `create_project "DoppelWriter"`), so Nick browses real mockups in the Claude app.
3. **Nick picks one.** That winner's tokens become the canonical table everything else is generated from.

Deliverable of Phase 0: a locked token table (palette, type, radius, motion) recorded in `DESIGN-SYSTEM.md` §Tokens.

**Open decision, resolved in Phase 0:** corner radius (hard `0` vs soft), exact accent hue, whether mono font changes. Do not pre-commit — these are what the visual round decides.

## Token layer (`globals.css`)

Rewrite the `@theme` block to the locked Phase-0 tokens. Structure:

- **Palette** — raw `--color-*` values (new warm-neutral ramp + accent).
- **Semantic aliases** so primitives never hardcode raw colors: `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--border`, `--brand`. Primitives read semantics; semantics map onto the palette. This is what lets a future tweak be one-line.
- **Type scale** — keep the modular-scale token approach; re-pin sizes to the new display face's rhythm.
- **Spacing** — keep the 8pt register (it's sound; no reason to churn it).
- **Radii + motion tokens** — `--radius`, `--motion-fast`, `--motion-base`, `--motion-cinematic` (values from Phase 0).

Helper classes (`.rule`, `.prose`, etc.) are retained but re-skinned to the new tokens. Old-brand-specific choreography (hero curtain, duotone sepia wash) is re-evaluated against the new motion language — kept, re-tuned, or dropped per the "precise/quick" direction.

## Primitive library — `src/components/ui/`

Thin, typed wrappers reading **semantic tokens only**. Each is a small focused file. A local `cn` helper for class merging; no heavy new deps (no full component framework).

- **`Button`** — variants `primary` / `ghost` / `accent`; sizes `sm` / `md`. Replaces all inline `px-_ py-_ border` buttons.
- **`Card`** — surface container; default + raised; optional hover treatment.
- **`Input` / `Textarea`** — formalized focus ring from the new token set.
- **`Badge` / `Chip`** — tags, usage pills, signature words.
- **`Eyebrow`** — the micro uppercase label used above headings.
- **`Rule`** — hairline divider as a component.
- **`Prose`** — line-length-clamped body wrapper.

Each primitive's public API (props/variants) is documented in `DESIGN-SYSTEM.md` and rendered in both `/style-guide` and the Claude Design cards.

## Living style guide — `/style-guide` route

A single Next route that renders the system **from the tokens themselves** (so it can't drift): color swatches + hex + WCAG contrast ratios, the full type scale as specimens, the spacing ruler, every primitive in every variant, and the motion/helper-class demos. **`noindex`** — internal reference, must not dilute the writer-page SEO corpus.

## Big-bang refactor

Migrate **all 27 token-using files** onto the new primitives + semantic tokens in one pass. Because the brand is changing, components are *expected* to look different — the goal is that every component sources its look from the system, with zero remaining inline raw-color/arbitrary-token usage. After this, a grep for `bg-[var(--color-` / hardcoded hex in `src/` returns nothing outside `globals.css` and the `ui/` primitives.

## Brand assets

Redo everything encoding the old identity:

- **Logo:** new mark + wordmark direction (`dw-mark.svg`, `dw-wordmark.svg`, `logo.png`) consistent with the new type/accent. Explored in Phase 0 alongside the palette.
- **OG images:** new static `og-image.png` + re-skin all **4 dynamic `opengraph-image.tsx` routes** to the new tokens/fonts.
- **Cinematic surfaces:** `HomepageCinematic.tsx`, `MarketingFilm.tsx`, writer-hero curtain re-treated to the new motion language (precise/quick).
- Writer portrait treatment (`.duotone` sepia wash over 127 `public/writers/` images) re-decided — the sepia is an ivory/ink artifact; the new brand picks its own portrait treatment.

## Mirror to the Claude app (`/design-sync` + DesignSync)

A `claude-design/` folder of standalone HTML preview cards — one per primitive variant set and per token group (Colors, Type, Spacing, Buttons, Cards, Inputs, Badges, Motion), each carrying a `@dsCard group="…"` first-line marker. Cards inline the actual token values + primitive markup so they render in the Claude app **without** the Next build — a true second source of truth, generated from the same token table as `/style-guide`. Pushed to the DoppelWriter DesignSync project incrementally (one component at a time, never wholesale replace). Reuses the Phase-0 project.

## Docs + CLAUDE.md fix

- **`DESIGN-SYSTEM.md`** at repo root — canonical written spec: token table, primitive APIs, do/don'ts, the three-surface model.
- **`CLAUDE.md`** — delete the stale dark/amber/Literata "Style" block; replace with a pointer to `DESIGN-SYSTEM.md` + `globals.css` as the single authority.

## Verification (the risk gate)

A rebrand + big-bang on a live ~530-page site needs proof of *function* (not pixel-identity — looks are *meant* to change):

- `npx next build` clean before any push (hard gate).
- **Playwright sweep** over a representative route set — `/`, `/write`, `/create/personal`, a `/write-like/[slug]`, `/merge`, `/analyze`, `/pricing`, `/style-guide` — confirming each renders without errors/broken layout under the new system, desktop + mobile.
- WCAG AA contrast re-checked on the new palette (the old ink-mute was darkened specifically to clear AA — the new tokens must clear it too, verified on the `/style-guide` contrast readout).
- Deploy via `git push origin main` (Vercel auto-deploy) only after build + sweep pass.

## Out of scope (YAGNI)

- No new product features, routes, or copy rewrites — this is identity + system only.
- No migration off Tailwind v4 / `@theme`.
- No heavyweight component framework (Radix/shadcn) — thin local primitives only.
- `/style-guide` is **not** an SEO/marketing surface; no indexing, no content investment beyond the spec rendering.
- No real-money/pricing/monetization changes (DoppelWriter remains a passive portfolio asset).

## Sequence

1. **Phase 0** — generate identity options → Claude Design → Nick picks → lock token table.
2. Token layer rewrite (`globals.css`) + semantic aliases.
3. `ui/` primitives built on locked tokens.
4. `/style-guide` route.
5. Big-bang refactor of all 27 files.
6. Brand assets (logo, OG ×5 routes, cinematic surfaces).
7. Claude-app sync (DesignSync cards).
8. `DESIGN-SYSTEM.md` + `CLAUDE.md` fix.
9. Verification (build + Playwright + contrast) → deploy.
