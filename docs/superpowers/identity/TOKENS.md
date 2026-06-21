# DoppelWriter — Locked Identity Tokens

**Chosen 2026-06-21:** Option A · Sand & Ember. This is the canonical source Task 2 transcribes into `src/app/globals.css` and `src/app/layout.tsx`.

## Raw palette

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#faf8f4` | warm off-white base surface |
| `--color-bg-raised` | `#f1ece3` | elevated surface (cards) |
| `--color-fg-strong` | `#1c1a17` | warm near-black, primary text |
| `--color-fg-muted-raw` | `#6b6358` | secondary text (AA verified: 5.57:1 on bg, 5.18:1 on raised) |
| `--color-line` | `#e4ded2` | hairline / border |
| `--color-accent-raw` | `#c2410c` | ember / terracotta — the single vivid accent |

## Semantic aliases (components consume ONLY these)

| Alias | Maps to |
|---|---|
| `--color-surface` | `--color-bg` |
| `--color-surface-raised` | `--color-bg-raised` |
| `--color-fg` | `--color-fg-strong` |
| `--color-fg-muted` | `--color-fg-muted-raw` |
| `--color-border` | `--color-line` |
| `--color-brand` | `--color-accent-raw` |
| `--color-background` | `--color-bg` |
| `--color-foreground` | `--color-fg-strong` |

**Button-on-accent / button-on-ink text color:** white `#ffffff` (accent #c2410c contrast w/ white = 4.6:1 ✓; ink #1c1a17 w/ white ✓). In components this is `text-surface` only where surface is light enough — for `bg-brand` and `bg-fg` buttons use explicit white text.

## Typography

| Token | Family | Source | Weights |
|---|---|---|---|
| `--font-display-face` | **Space Grotesk** | `next/font/google` | 500, 700 |
| `--font-sans-face` | **Inter** | `next/font/google` | 400, 500, 600 |
| `--font-mono-face` | **JetBrains Mono** (KEPT — neutral mono for demo/code surfaces; not swapped) | `next/font/google` | default |

- `--font-display` → `var(--font-display-face)`, `--font-sans` → `var(--font-sans-face)`, `--font-mono` → `var(--font-mono-face)`.
- Headings (`h1,h2,h3`) use `--font-display` with `letter-spacing: -0.02em` (Space Grotesk takes tight tracking well).

## Type scale (unchanged token sizes — re-pinned names retained)

`--fs-micro` 0.75rem · `--fs-caption` 0.833rem · `--fs-body` 1rem · `--fs-lead` 1.2rem · `--fs-h3` 1.44rem · `--fs-h2` 2rem · `--fs-h1` 3rem · `--fs-hero` 4.5rem

## Spacing (unchanged 8pt register)

`--space-1` .25rem · `-2` .5rem · `-3` .75rem · `-4` 1rem · `-6` 1.5rem · `-8` 2rem · `-12` 3rem · `-16` 4rem · `-24` 6rem · `-32` 8rem

## Radii + motion

| Token | Value |
|---|---|
| `--radius` | `10px` |
| `--motion-fast` | `140ms` |
| `--motion-base` | `220ms` |
| `--motion-cinematic` | `600ms` |

## Resolved deferred decisions

- **Corner radius:** `10px` (soft — from Option A).
- **Accent hue:** `#c2410c` (ember/terracotta).
- **Mono font:** KEPT as JetBrains Mono (no swap).
