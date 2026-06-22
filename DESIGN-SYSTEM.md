# DoppelWriter — Design System Reference

> **Canonical source.** Updated 2026-06-21. See also: `/style-guide` (live, noindex) · claude.ai/design (browsable cards).

---

## 1. Brand Direction

DoppelWriter uses a **Modern AI-product, warm** aesthetic — the Sand & Ember palette chosen 2026-06-21 as a full rebrand away from the original literary ivory/ink/amber theme. The surface is a warm off-white (#faf8f4), the accent is a single vivid ember/terracotta (#c2410c), and the display typeface is Space Grotesk — together projecting precision and warmth rather than old-press literariness. The tone is assured and slightly irreverent; the visual language is editorial without being antiquarian.

---

## 2. Token Table

### Raw Palette

These are the locked primitive values. **Components must never reference these directly** — use semantic aliases below.

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#faf8f4` | warm off-white base surface |
| `--color-bg-raised` | `#f1ece3` | elevated surface (cards) |
| `--color-fg-strong` | `#1c1a17` | warm near-black, primary text |
| `--color-fg-muted-raw` | `#6b6358` | secondary text (AA verified: 5.57:1 on bg, 5.18:1 on raised) |
| `--color-line` | `#e4ded2` | hairline / border |
| `--color-accent-raw` | `#c2410c` | ember / terracotta — the single vivid accent |

### Semantic Aliases (components consume ONLY these)

| Alias | Maps to | When to use |
|---|---|---|
| `--color-surface` | `--color-bg` | default page/component background |
| `--color-surface-raised` | `--color-bg-raised` | elevated cards, popovers |
| `--color-fg` | `--color-fg-strong` | body text, icons, borders-on-dark |
| `--color-fg-muted` | `--color-fg-muted-raw` | secondary / supporting text |
| `--color-border` | `--color-line` | hairlines, dividers, input borders |
| `--color-brand` | `--color-accent-raw` | primary CTAs, highlights, accent badges |
| `--color-accent` | `--color-accent-raw` | shorthand for brand accent (identical to brand) |
| `--color-background` | `--color-bg` | Next.js / Tailwind default background |
| `--color-foreground` | `--color-fg-strong` | Next.js / Tailwind default foreground |

### Legacy Back-Compat Aliases (7 total)

These exist **only** so un-migrated components automatically reskin without a find-replace sweep. Do not use them in new code.

| Legacy alias | Value | Original meaning |
|---|---|---|
| `--color-ink` | `var(--color-fg-strong)` (#1c1a17) | dark ink — was primary text |
| `--color-ink-soft` | `#4a443b` | warm mid — AA on surface (4.68:1) |
| `--color-ink-mute` | `var(--color-fg-muted-raw)` (#6b6358) | muted ink |
| `--color-paper` | `var(--color-bg)` (#faf8f4) | base surface |
| `--color-paper-deep` | `var(--color-bg-raised)` (#f1ece3) | elevated surface |
| `--color-rule` | `var(--color-line)` (#e4ded2) | hairline / divider |

The seventh legacy alias is `--color-ink-soft` (listed above as a direct hex, not a pointer). These will be removed in a future Plan B migration once all components are on semantic tokens.

### Typography

| Token | Family | Source | Weights | Role |
|---|---|---|---|---|
| `--font-display` / `--font-display-face` | **Space Grotesk** | `next/font/google` | 500, 700 | Display headings (h1–h3) |
| `--font-sans` / `--font-sans-face` | **Inter** | `next/font/google` | 400, 500, 600 | Body copy, UI |
| `--font-mono` / `--font-mono-face` | **JetBrains Mono** | `next/font/google` | default | Code, demo surfaces |

Headings (`h1`, `h2`, `h3`) use `--font-display` with `letter-spacing: -0.02em` and `line-height: 1.05`.

### Type Scale

| Token | Value | Pixels | Use |
|---|---|---|---|
| `--fs-micro` | 0.75rem | 12px | Eyebrows, tags, timestamps |
| `--fs-caption` | 0.833rem | ~13px | Captions, footer links |
| `--fs-body` | 1rem | 16px | Body copy |
| `--fs-lead` | 1.2rem | ~19px | Lede / sub-headings |
| `--fs-h3` | 1.44rem | ~23px | H3 |
| `--fs-h2` | 2rem | 32px | H2 |
| `--fs-h1` | 3rem | 48px | H1 (writer page) |
| `--fs-hero` | 4.5rem | 72px | Homepage hero |

### Spacing (8pt register)

| Token | Value | px |
|---|---|---|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-24` | 6rem | 96px |
| `--space-32` | 8rem | 128px |

### Radii + Motion

| Token | Value | Notes |
|---|---|---|
| `--radius` | `10px` | All rounded corners — "soft" from Option A |
| `--motion-fast` | `140ms` | Micro-interactions, color transitions |
| `--motion-base` | `220ms` | Default component transitions |
| `--motion-cinematic` | `600ms` | Page-level reveals, hero choreography |

---

## 3. Primitives

### Static Primitives

#### `Button`

```tsx
<Button variant="primary" | "ghost" | "accent" size="sm" | "md" />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "ghost" \| "accent"` | `"primary"` | primary = ink bg / surface text; ghost = transparent + border; accent = brand bg / surface text |
| `size` | `"sm" \| "md"` | `"md"` | sm: caption text / tight padding; md: body text / standard padding |
| `className` | `string` | — | merged via `cn()` |
| `...props` | `ButtonHTMLAttributes` | — | all native button props |

Focus ring: 1px outline at `--color-fg`, offset 2px. Disabled: 50% opacity, no pointer events.

#### `Card`

```tsx
<Card raised? />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `raised` | `boolean` | `false` | false = `--color-surface` bg; true = `--color-surface-raised` bg |
| `className` | `string` | — | merged via `cn()` |
| `...props` | `HTMLAttributes<div>` | — | |

Always has `--radius` corners, `--color-border` border, `p-6` padding.

#### `Input`

```tsx
<Input />
```

Full-width. Surface background, `--color-fg` text, `--color-border` border, `--radius` corners. Placeholder in `--color-fg-muted`. Focus: 1px `--color-fg` outline, 2px offset. Accepts all `InputHTMLAttributes`.

#### `Textarea`

```tsx
<Textarea />
```

Identical styling to `Input`. Accepts all `TextareaHTMLAttributes`.

#### `Badge`

```tsx
<Badge tone="default" | "brand" />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `"default" \| "brand"` | `"default"` | default = border + muted text; brand = brand-colored border + brand text |

`--fs-micro` text, `--radius` corners, border-only style (no fill).

#### `Eyebrow`

```tsx
<Eyebrow />
```

`<p>` element. `--fs-micro`, uppercase, `tracking-[0.12em]`, `--color-fg-muted`. No configurable props beyond `className` and standard paragraph attributes.

#### `Rule`

```tsx
<Rule />
```

`<hr>` rendered as a 1px `--color-border` line (border:0, height:1px, background). No props beyond `className`.

#### `Prose`

```tsx
<Prose />
```

`<div>` wrapper. `max-w-[65ch]`, `leading-relaxed`, `--color-fg` text. Clamps body-copy line length to 55–70ch for readability.

---

### Motion Primitives

All four motion components are **`"use client"`** and built on Framer Motion. All honor `prefers-reduced-motion` via `MotionConfig reducedMotion="user"` — when the OS preference is set, animations are skipped automatically.

#### `MotionProvider`

```tsx
<MotionProvider>{children}</MotionProvider>
```

Wraps the tree in `<MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>`. Must be placed high in the component tree (e.g. root layout). All Framer Motion animations inside it inherit the default transition and the reduced-motion gate.

**Rule: every page that uses motion primitives must be wrapped in `MotionProvider`.**

#### `Reveal`

```tsx
<Reveal delay={0} y={12} />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `delay` | `number` (seconds) | `0` | Framer Motion transition delay |
| `y` | `number` (px) | `12` | Initial vertical offset (fades in from below) |
| `className` | `string` | — | |
| `...props` | `HTMLAttributes<div>` | — | |

Triggers `whileInView` (once, `-80px` margin). Useful for section reveals.

#### `Stagger`

```tsx
<Stagger gap={0.06}>{children}</Stagger>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `gap` | `number` (seconds) | `0.06` | `staggerChildren` delay between each direct child |
| `className` | `string` | — | |
| `...props` | `HTMLAttributes<div>` | — | |

Wraps children in a `whileInView` variant container. Children must use Framer Motion variants (`hidden`/`show`) to participate. Triggers once, `-80px` margin.

#### `HoverLift`

```tsx
<HoverLift lift={-3}>{children}</HoverLift>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `lift` | `number` (px) | `-3` | `y` offset on hover (negative = up) |
| `className` | `string` | — | |
| `...props` | `HTMLAttributes<div>` | — | |

Spring physics: `stiffness: 400, damping: 28`. Resets to `y: 0` on tap/press. Wraps any card or interactive element.

---

## 4. Token-Usage Convention

**Components reference tokens exclusively via Tailwind's arbitrary-value syntax:**

```tsx
// CORRECT
className="bg-[var(--color-surface)] text-[var(--color-fg)] border-[var(--color-border)]"

// WRONG — raw Tailwind utility without token
className="bg-stone-50 text-stone-900 border-stone-200"

// WRONG — raw hex in class
className="bg-[#faf8f4]"
```

This is the enforced pattern throughout the codebase. Tailwind's `@theme inline` block in `globals.css` wires up the CSS custom properties; components then consume them by name. The arbitrary-syntax approach means no Tailwind config changes are needed to add new tokens — define in `@theme`, reference via `[var(--color-*)]`.

---

## 5. Do / Don'ts

**Do:**
- Read **semantic tokens only** (`--color-surface`, `--color-fg`, `--color-border`, `--color-brand`, etc.)
- Use Tailwind arbitrary syntax: `bg-[var(--color-surface)]`, `text-[var(--color-fg)]`
- Wrap any page using motion primitives in `<MotionProvider>`
- Honor reduced-motion automatically — `MotionProvider` + `reducedMotion="user"` handles it; do not re-implement
- Use `--radius` (10px) consistently for all rounded corners

**Don't:**
- Reference raw hexes directly in component classNames or styles (e.g. `bg-[#faf8f4]`)
- Use raw palette tokens in components (`--color-bg`, `--color-fg-strong`, `--color-accent-raw`, etc.)
- Use the legacy aliases `--color-ink`, `--color-paper`, `--color-rule`, `--color-paper-deep`, `--color-ink-soft`, `--color-ink-mute` in **new** code — they exist only to auto-reskin un-migrated components and will be removed in Plan B
- Use bare Tailwind color utilities (e.g. `text-stone-700`, `bg-amber-600`) — these bypass the token system
- Animate without `MotionProvider` in scope

---

## 6. Three-Surface Model

| Surface | Path | Notes |
|---|---|---|
| **Canonical reference** | `DESIGN-SYSTEM.md` (this file) | Source of truth for tokens, primitives, conventions |
| **Live style guide** | `/style-guide` | Running app route; `noindex`; public but not linked from nav |
| **Browsable cards** | `claude.ai/design` | Design sync; browsable component cards for AI-assisted work |

When token values or component APIs change, update `DESIGN-SYSTEM.md` first, then `src/app/globals.css`, then the component file. The `/style-guide` route reflects the live code automatically.
