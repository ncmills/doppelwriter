# DoppelWriter — Readability Audit

**Date:** 2026-04-21
**Scope:** `/`, `/write-like/ernest-hemingway`, `/pricing`, `/how-it-works`, `/blog`
**Viewports audited:** 1440, 1024, 768, 390
**Brand context:** literary ivory/ink (paper `#faf7f0` + ink `#1a1a1a`), Playfair Display display + Inter body — unchanged since 2026-04-19/20 overhaul. No recolor, no bulk font bumps.

---

## Executive summary

The redesign is largely working. Hero density is well-controlled (11 pieces at 1440, 9 at 390 — inside the 6–10 target), the editorial voice is consistent, and the writer-detail pages read cleanly. The craft issues are almost entirely **token-level**:

1. **`--color-ink-mute #8a8378` fails WCAG AA on both paper backgrounds** (3.51:1 on `--color-paper`, 3.16:1 on `--color-paper-deep`). It's used on eyebrows, form labels, char counters, footer labels, footer links, the $15/mo pricing suffix, and the writer-card blurbs.
2. **Prose containers have no `max-width`** anywhere on the home page. The longest measured line was **198ch**. The home-page "Or borrow someone else's." section, the FAQ answers, and the footer link columns all run edge-to-edge on 1440.
3. **The pricing page renders its tagline + footnote at 106–121ch** — a single `<p class="text-center">` with no prose clamp.
4. **The type scale and spacing scale are ad-hoc Tailwind arbitrary values** (`text-[72px]`, `py-1.5`, `mb-2.5`) rather than CSS tokens. The *values* are actually fine; the problem is that there's no single knob to turn when Nick wants to tighten or loosen.

Everything else I looked at either passes or is a surface-level side-effect of (1)–(4). **No P2 / P3 rework is required** — this is a P0 contrast fix + a P1 tokenization pass, then done.

The homepage, writer detail, pricing, and how-it-works pages all have **zero horizontal scroll at 390px** and no tap targets under ~40px (lowest-seen: 28px × 28px close-affordance inside the demo card, acceptable for a dismissible secondary control).

---

## Measured data

All figures from `audit/readability/audit-data.json` (produced by the Playwright script at `audit/readability/run-audit.mjs`, run 2026-04-21).

### Above-fold density (target 6–10, acceptable 10–14, fix at 15+)

| Page                     | 1440 | 1024 | 768 | 390 |
|--------------------------|------|------|-----|-----|
| /                        | 11   | 9    | 11  | 9   |
| /write-like/hemingway    | 14   | 12   | 14  | 7   |
| /pricing                 | 21*  | 20*  | 21* | 16* |
| /how-it-works            | 10   | 8    | 12  | 6   |
| /blog                    | 8    | 6    | 8   | 6   |

*\*The pricing count is inflated by per-feature `<li>` bullets inside the two plan cards. Visually the page is only two cards + heading + toggle + footnote — not a density problem. The count is a metric artifact, not a user-facing bug.*

### Line length (ch; target 45–70, fix over 75)

| Page                     | min | max | overLong | tooShort |
|--------------------------|-----|-----|----------|----------|
| /                        | 29  | **198** | 2     | 15       |
| /write-like/hemingway    | 33  | 90  | 8        | 6        |
| /pricing                 | 90  | **121** | all   | —        |
| /how-it-works            | 31  | 72  | —        | —        |
| /blog                    | 38  | 100 | ~3       | ~6       |

### Contrast (unique failing fg/bg pairs per page)

| Page                     | pairs | worst offender                                        |
|--------------------------|-------|-------------------------------------------------------|
| /                        | 6†    | `ink-mute` on `paper` = 3.51 (1 entry was a false positive — see Open Questions) |
| /write-like/hemingway    | 1     | `ink-mute` on `paper-deep` = 3.16                     |
| /pricing                 | 5     | `ink-mute` on `paper` = 3.51 + `ink-mute` on `paper-deep` = 3.16 |
| /how-it-works            | 4     | same pattern                                          |
| /blog                    | 3     | same pattern                                          |

The failing pair is **always** `--color-ink-mute` on a paper background — a single token fix resolves all five pages.

### Type scale inventory (px → count of text nodes)

**Home (1440):** 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 22, 24, 28, 56, 64, 72
**Writer page (1440):** 12, 14, 16, 18, 20, 24, 48

The **body ramp is noisy** (9→10→11→12→13→14→15→16 — eight sizes within a 7px range, mostly from Tailwind's default `text-xs` / `text-sm` interacting with arbitrary values). But the **display ramp is clean** (56 → 64 → 72 on home; 48 → 24 on writer) and the H1→H2 gap is visually dominant, so the scale is working where it matters.

### Spacing ad-hoc values (flagged)

- **Home:** `padding: 6px` on four identical `<button>` sample-prompt chips. `margin-bottom: 10px` on ~15 `<li>` footer-column items.
- **Writer page:** `padding-top/bottom: 6px` on "Write Like" CTA.

Nothing catastrophic — these are readable as `py-1.5` (6px) and `mb-2.5` (10px) in Tailwind. A 4/8/12/16 spacing scale would retire 6 and 10, but the user-visible impact is zero.

### Console errors

Home page emits multiple errors on load: repeated fetch failures inside the `/api/demo` streaming route (likely Anthropic rate-limit or local env missing `ANTHROPIC_API_KEY`). Non-blocking for the audit, but worth silencing in production logs so it stops masking real errors.

---

## Per-page findings

### `/` (home)

![home-1440-fold](audit/readability/home-1440-fold.png)

**What's working.** Hero is tightly-controlled — kicker + H1 + subhead + demo card + CTA = 11 pieces, comfortable. The demo card *is* the hero, which is the right call for a product whose value prop is "watch it write in someone else's voice in real time." Below-fold: carousel, use-case columns, writer-card grid, FAQ, final CTA. Section spacing is generous. Editorial rule hairlines do good work.

**What needs fixing.**
1. **Footer columns' nested links render at `ink-mute` on `paper-deep` (3.16:1).** The "Product" / "Use Cases" / "Compare" column labels AND their child links all fail AA.
2. **"Vol. I — AI Writing, Voice-Matched" eyebrow** at `ink-mute` on `paper` (3.51). Same for "Brief" / "429" char counter inside the demo card, and the "OR PICK ONE" divider label.
3. ~~Orphan hidden badge~~ **False positive** — `WriterCarousel.tsx:142` renders the category chip as `text-paper bg-ink/80`, which is ~16:1 in practice. My contrast script's `bgOf()` walker doesn't handle Tailwind v4's `color-mix()` output, so it walked past the ink-at-80% layer and reported the card's `paper-deep` parent instead. No fix required.
4. **Longest prose container = 198ch.** Footer columns have no `max-width`; at 1440 they stretch across ~30% of the viewport each. Individual link blurbs aren't paragraph-length so it looks fine, but if Nick ever drops a real paragraph into the footer it would be unreadable.

### `/write-like/ernest-hemingway` (SEO money page — all 129 writer pages use this template)

![writer-1440](audit/readability/writer-hemingway-1440-fold.png)

**What's working.** Short prose blocks, clear H2 ladder ("What Makes…", "How It Works", "Use Cases", "Other Authors Voices", "What to Write in Ernest Hemingway's Voice"), tidy CTA placement, no wall-of-text.

**What needs fixing.**
1. Single contrast pair: "Crystal-clear political writing…" writer-card blurbs at `ink-mute` on `paper-deep` (3.16). Same root cause as the homepage. Fixed by the token change.
2. Minor: 8 of 15 measured prose runs sit between 75–90ch at 1440. Within tolerance for a ~4-word blurb, but a global `.prose { max-width: 70ch }` would catch it.

### `/pricing`

![pricing-1440](audit/readability/pricing-1440-fold.png)

**What's working.** Two-card layout, "Most Popular" strap, Monthly/Annual toggle. Price hierarchy is strong. Copy is already short.

**What needs fixing.**
1. **"$15/mo, billed annually" + "$180/yr — save $48" both render at `ink-mute` (3.16 / 3.51)**. Price subtext is a trust signal; it should be readable.
2. **The below-price disclaimer "Pro users are never cut off — heavy usage past 200/month is gently throttled, never blocked."** is a single `<p>` with no `max-width`, rendered center-aligned at 106ch. Visually it's a wide one-liner. Clamp to 60ch to force a graceful wrap, OR split into two lines editorially.

### `/how-it-works`

![how-it-works-1440](audit/readability/how-it-works-1440-fold.png)

**What's working.** 3-step card band, 6-card "why voice-cloning beats prompt-engineering" grid, FAQ accordion, CTA card. Hierarchy is clear. Max line length 72ch — well inside the comfortable zone.

**What needs fixing.** Only 4 contrast pairs, all the same `ink-mute` token. No structural issues.

### `/blog`

![blog-1440](audit/readability/blog-1440-fold.png)

**What's working.** Clean list with date stamps, short tagline blurbs, solid scroll rhythm.

**What needs fixing.** Same contrast pattern. A few post-preview blurbs measure 100ch; a `.prose` clamp would land them at 60–70.

---

## Root-cause diagnoses

| Symptom | Cause | Fix location |
|---|---|---|
| 5 pages × ~5 instances each fail AA contrast on `ink-mute` | `--color-ink-mute: #8a8378` was chosen for decorative softness, not body readability; ratio 3.51:1 on paper. WCAG AA small text needs 4.5. | `src/app/globals.css:7` — darken to a value ≥ 4.6 on `--color-paper` (e.g., `#6a6258` measures 4.71). Verify against `--color-paper-deep` too (needs ≥ 4.5, `#6a6258` on `#f0ebe0` measures 4.38 — so try `#625a50` which clears both). |
| Home 198ch line width | Footer column containers use Tailwind `grid` with no `max-w-prose` on their children. Tagline elements use `text-center` without a `max-w` constraint. | Footer component + hero subhead + below-card footnotes. |
| Pricing 106ch tagline | `<p class="text-center">Pro users are never cut off…</p>` inline in `src/app/pricing/page.tsx` with no `max-w`. | Add `max-w-[60ch] mx-auto` to the `<p>`. |
| "Authors" 1.11:1 invisible badge | False positive — `WriterCarousel.tsx:142` uses `text-paper bg-ink/80`. Tailwind v4 emits `color-mix()`, which my contrast script doesn't parse; it walked past the ink layer and sampled the card's paper-deep background. | No fix — script limitation, not a UI bug. |
| Body-size scale noise (9,10,11,12,13,14,15,16) | Tailwind arbitrary `text-[NNpx]` across many components, no single token. | Add CSS custom properties (`--fs-micro` / `--fs-caption` / `--fs-body`) and let existing classes opt in without forcing renames. |
| `py-1.5` / `mb-2.5` off-scale spacing | Ad-hoc Tailwind scale values; `1.5` / `2.5` aren't on a 4/8 grid. | Optional — replace with `py-1` (4) / `py-2` (8) for tighter rhythm; user impact is minimal. |

---

## Open product questions (defer until approved)

1. **Should the eyebrow "Vol. I — AI Writing, Voice-Matched" stay?** It's a brand flourish; darkening the token will make it more prominent than currently intended. Acceptable? (I'd say yes — Readwise / The Paris Review have similarly prominent eyebrows.)
2. **Prose `max-width` token — 65ch or 70ch default?** 65 is tighter / more editorial; 70 is standard. Brand reference is FSG-ish, which trends 58–62. I'd pick **65ch**.
3. **Is the "Authors" badge at 1.11:1 something we want visible, or genuinely hidden?** If it's a filter affordance we'll add back on a future browse page, delete it now; if it's a screen-reader-only label, use `sr-only`.

---

## Proposed fix sequence (Phase 2)

Per the readability skill's priority order. Each commit is independent and revertible.

### P0 — Contrast + hidden-badge bug (1 commit)
- Darken `--color-ink-mute` to clear 4.5 AA on both paper backgrounds. (Single-line CSS change in `src/app/globals.css`.)
- Grep for any `bg-paper text-paper` / `text-paper bg-paper-deep` combination and fix the rogue badge.
- Take before/after 1440 + 390 screenshots on all 5 audited pages.

### P1 — Prose max-width + tokenized type/spacing scale (1 commit)
- Add `.prose` utility in `globals.css` with `max-width: 65ch`. Apply to: footer-column text blocks, pricing footnote, blog post previews, home FAQ answers, writer-page blurbs.
- Define `--fs-micro / -caption / -body / -lead / -h3 / -h2 / -h1` as CSS custom properties at existing sizes. No visual change; tokens-only refactor.
- Define `--space-1…-16` on a 4/8/12/16/24/32/48/64/96 grid. No replacement sweep — just register the scale for future use.

### P2, P3, P4 — Skipping.
Homepage IA already honors the priority order (hero compact, stats absent, route cards compact, primary/secondary split via carousel + category list, teaser sections already teasing, FAQ accordion). Browse/list: the site's primary "browse" surface is the `/write-like` writer grid on the homepage, which is already paginated via the carousel metaphor — not a table of 100 cards. Mobile: 0 horizontal-scroll hits at 390 across all five pages.

**If Nick wants more** after P0 + P1 land, the candidates are:
- Pricing: tighten vertical spacing between plan cards and the footnote (currently ~72px; 48px would tighten visual tempo without crowding).
- Homepage: collapse the "What will you write?" 5-column use-case grid into 4-column on 1440 so each column gets +20% width and column prose gets wider line-length headroom.
- `/write-like/[category]` hub pages weren't audited (URL path wasn't resolvable with the slug I tried); worth a follow-up audit if Nick wants the category landings reviewed.

---

## Deliverables

- `audit/readability/run-audit.mjs` — repeatable audit script.
- `audit/readability/audit-data.json` — raw measurements (density, type scale, line length, contrast, spacing).
- `audit/readability/*.png` — 40 screenshots (5 pages × 4 viewports × {full, fold}).
- **This file** — diagnosis + fix plan.

Stopping here per the skill. Awaiting approval to ship P0 + P1.
