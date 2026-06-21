# DoppelWriter Design System Foundation — Implementation Plan (Plan A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock a new "Modern AI-product, warm" brand identity and build a token-driven design system for it, viewable in three surfaces (canonical doc, `/style-guide` route, claude.ai/design).

**Architecture:** A single token table (palette + type + radii + motion) lives in `globals.css` `@theme`. Semantic aliases (`--color-surface`, `--color-fg`, `--color-brand`, …) sit on top of the raw palette so components never hardcode brand colors. Thin typed primitives in `src/components/ui/` read those semantics via Tailwind v4 utilities. The same token table renders the live `/style-guide` route and a set of standalone HTML cards pushed to the Claude Design app.

**Tech Stack:** Next.js 16 App Router, Tailwind v4 (`@theme` in CSS), `next/font/google`, TypeScript, `DesignSync` tool + `/design-sync` skill, Playwright (verification).

**Scope note:** This is Plan A. The big-bang refactor of all 27 token-using components, logo/OG/cinematic asset redo, and final pre-deploy verification are **Plan B**, written after this plan's primitives exist (so Plan B can reference real primitive APIs). Plan A is additive + reskin only; it does not rewrite the 27 components' markup.

## Global Constraints

- Next.js 16 App Router; Tailwind v4 with `@theme` in `src/app/globals.css` — no migration off this.
- No heavyweight component framework (no Radix/shadcn); thin local primitives only. No new runtime deps beyond what's already in `package.json` — a local `cn` helper, not `clsx`/`tailwind-merge`, unless already present.
- Brand direction is fixed: **Modern AI-product, warm** — bold grotesk display + clean sans, warm-neutral base + exactly one vivid accent, precise/quick motion. No blue-corporate.
- Components read **semantic tokens only** (`bg-surface`, `text-fg`, `border-border`, `bg-brand`, …), never raw `--color-*` palette values or arbitrary hexes.
- `/style-guide` is `noindex` — must not enter the sitemap or be crawlable.
- WCAG AA (4.5:1 body, 3:1 large) must hold on the new palette; verified on the `/style-guide` contrast readout.
- Deploy is `git push origin main` (Vercel auto-deploy). **No pushing in Plan A** — local commits only; Nick controls the deploy.
- Every change builds clean (`npx next build`) before commit.

---

### Task 1: Phase 0 — Lock the identity (design decision gate)

**This task is operator-driven, not TDD.** It produces the token values every later task consumes. Run it in the main session with Nick, not a headless subagent.

**Files:**
- Create: `docs/superpowers/identity/option-a.html`, `option-b.html`, `option-c.html` (self-contained mockups, throwaway after pick)
- Create: `docs/superpowers/identity/TOKENS.md` (the locked table — the durable output)

**Interfaces:**
- Produces: a locked token table with exact values for: palette ramp (warm-neutral surfaces + foregrounds + border), one accent hue, display font family, sans font family, mono font decision, `--radius`, `--motion-fast`/`--motion-base`/`--motion-cinematic`. Task 2 consumes this verbatim.

- [ ] **Step 1: Generate 3 identity options as standalone HTML.** Each file inlines its own `:root` token block and renders the same fixed sample: a hero headline + subhead, a primary + ghost + accent button row, one card, one input, and a row of palette swatches with hex labels. All three share layout; only tokens differ. Direction per option:
  - `option-a.html`: warm neutral (sand/stone) + a single warm accent (e.g. terracotta/amber-red), bold grotesk display (e.g. system `ui-sans-serif` stand-in labeled "Geist/Satoshi-class"), clean sans body.
  - `option-b.html`: cooler warm-gray base + a vivid single accent (e.g. electric coral or signal green), tighter geometric grotesk.
  - `option-c.html`: deeper "ink on warm paper, modernized" — near-black warm fg, off-white warm bg, one saturated accent; the bridge option from the old literary feel toward modern.
- [ ] **Step 2: Push options to Claude Design.** Use the `/design-sync` skill. `DesignSync` `list_projects`; reuse a DoppelWriter design-system project if present, else `create_project` name `"DoppelWriter"`. `finalize_plan` writing `identity/option-*.html`, then `write_files`. Each HTML's first line carries `<!-- @dsCard group="Identity Options" -->`.
- [ ] **Step 3: Nick reviews in claude.ai/design and picks one option** (or requests a blend). Capture the choice.
- [ ] **Step 4: Record the locked table** in `docs/superpowers/identity/TOKENS.md` with exact hex values, font names, radius, and motion durations. Resolve the deferred decisions here: corner radius value, exact accent hex, mono-font keep-or-swap.
- [ ] **Step 5: Commit.**

```bash
git add docs/superpowers/identity/
git commit -m "design: lock new DoppelWriter identity (modern AI-product, warm)"
```

---

### Task 2: Token layer + semantic aliases + fonts

**Files:**
- Modify: `src/app/globals.css` (the `@theme inline` block, lines ~3–43)
- Modify: `src/app/layout.tsx` (font imports ~2, font consts ~9–26, `<html>` className)
- Test: manual build + contrast check (no unit test — this is CSS/config)

**Interfaces:**
- Consumes: the locked token table from Task 1 (`docs/superpowers/identity/TOKENS.md`).
- Produces: semantic utility tokens available app-wide — `bg-surface`, `bg-surface-raised`, `text-fg`, `text-fg-muted`, `border-border`, `bg-brand`, `text-brand`, plus `--radius`, `--motion-fast`, `--motion-base`, `--motion-cinematic`. Every later task and every existing component reads these.

- [ ] **Step 1: Rewrite the `@theme inline` block.** Replace the ivory/ink palette with Task 1's raw values, and add the semantic alias layer. Structure (fill raw values from TOKENS.md):

```css
@theme inline {
  /* Raw palette — Modern AI-product warm (values from identity/TOKENS.md) */
  --color-bg:            <hex>;   /* warm base */
  --color-bg-raised:     <hex>;   /* elevated surface */
  --color-fg-strong:     <hex>;   /* primary text */
  --color-fg-muted-raw:  <hex>;   /* secondary text — must clear AA on bg */
  --color-line:          <hex>;   /* hairline/border */
  --color-accent-raw:    <hex>;   /* the one vivid accent */

  /* Semantic aliases — components consume ONLY these */
  --color-surface:        var(--color-bg);
  --color-surface-raised: var(--color-bg-raised);
  --color-fg:             var(--color-fg-strong);
  --color-fg-muted:       var(--color-fg-muted-raw);
  --color-border:         var(--color-line);
  --color-brand:          var(--color-accent-raw);

  /* Background/foreground defaults */
  --color-background: var(--color-bg);
  --color-foreground: var(--color-fg-strong);

  /* Typography — new faces from TOKENS.md */
  --font-display: var(--font-display-face);
  --font-sans:    var(--font-sans-face);
  --font-mono:    var(--font-mono-face);

  /* Type scale — re-pinned to new display rhythm (keep token names) */
  --fs-micro: 0.75rem;  --fs-caption: 0.833rem; --fs-body: 1rem;
  --fs-lead: 1.2rem;    --fs-h3: 1.44rem;       --fs-h2: 2rem;
  --fs-h1: 3rem;        --fs-hero: 4.5rem;

  /* Spacing — unchanged 8pt register */
  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;
  --space-6: 1.5rem; --space-8: 2rem; --space-12: 3rem; --space-16: 4rem;
  --space-24: 6rem;  --space-32: 8rem;

  /* Radii + motion (values from TOKENS.md) */
  --radius: <value>;
  --motion-fast: 140ms; --motion-base: 220ms; --motion-cinematic: 600ms;
}
```

- [ ] **Step 2: Re-skin the body/heading/helper rules** below `@theme` to read the new tokens. Update `body { background: var(--color-surface); color: var(--color-fg); }`, the `h1,h2,h3` font-family to `var(--font-display)`, and `.rule { background: var(--color-border); }`. Leave the choreography keyframes intact for now (Plan B re-tunes motion).
- [ ] **Step 3: Swap fonts in `layout.tsx`.** Replace the `Playfair_Display`/`Inter`/`JetBrains_Mono` imports with the Task-1 faces (e.g. a grotesk display + clean sans; keep or swap mono per TOKENS.md). Update the `next/font/google` consts, their `variable` names to match `--font-display-face`/`--font-sans-face`/`--font-mono-face`, and the `<html className>` to include the new variable classes. Update `weight` arrays to what each face needs (display likely needs `700`/`800`).
- [ ] **Step 4: Build clean.**

Run: `npx next build`
Expected: build completes, no type/CSS errors.

- [ ] **Step 5: Contrast check.** Start dev (`npx next dev`), open `/`, and confirm `--color-fg-muted` on `--color-surface` and `--color-surface-raised` both clear 4.5:1 (use a contrast calculator on the two hex pairs from TOKENS.md). If either fails, darken `--color-fg-muted-raw` and rebuild — same fix the old `ink-mute` got.
- [ ] **Step 6: Commit.**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat(design): apply new warm token palette + fonts; add semantic aliases"
```

---

### Task 3: `cn` helper + Button primitive

**Files:**
- Create: `src/components/ui/cn.ts`
- Create: `src/components/ui/Button.tsx`
- Create: `src/app/_smoke/page.tsx` (temporary render-smoke harness; deleted in Task 6 once `/style-guide` exists)

**Interfaces:**
- Produces:
  - `cn(...parts: Array<string | false | null | undefined>): string` — joins truthy class strings.
  - `Button` — props `{ variant?: "primary" | "ghost" | "accent"; size?: "sm" | "md" } & React.ButtonHTMLAttributes<HTMLButtonElement>`. Default `variant="primary"`, `size="md"`. Renders a `<button>`.

- [ ] **Step 1: Write `cn`.**

```ts
// src/components/ui/cn.ts
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
```

- [ ] **Step 2: Write `Button`.**

```tsx
// src/components/ui/Button.tsx
import { cn } from "./cn";

type Variant = "primary" | "ghost" | "accent";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center font-medium rounded-[var(--radius)] " +
  "transition-colors duration-[var(--motion-fast)] focus-visible:outline focus-visible:outline-1 " +
  "focus-visible:outline-fg focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-surface hover:bg-fg-muted",
  ghost: "bg-transparent text-fg border border-border hover:bg-surface-raised",
  accent: "bg-brand text-surface hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "text-[var(--fs-caption)] px-3 py-1.5",
  md: "text-[var(--fs-body)] px-5 py-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: { variant?: Variant; size?: Size } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
```

- [ ] **Step 3: Render-smoke harness.** Create `src/app/_smoke/page.tsx` importing `Button` and rendering all three variants × two sizes.

```tsx
// src/app/_smoke/page.tsx
import { Button } from "@/components/ui/Button";
export default function Smoke() {
  return (
    <main className="p-12 flex flex-wrap gap-4">
      {(["primary", "ghost", "accent"] as const).map((v) =>
        (["sm", "md"] as const).map((s) => (
          <Button key={v + s} variant={v} size={s}>{v} {s}</Button>
        )),
      )}
    </main>
  );
}
```

- [ ] **Step 4: Build + render check.**

Run: `npx next build` then `npx next dev`, open `/_smoke`.
Expected: build clean; all six buttons render with the new tokens (fill, hairline ghost, accent), focus ring visible on tab.

- [ ] **Step 5: Commit.**

```bash
git add src/components/ui/cn.ts src/components/ui/Button.tsx src/app/_smoke/page.tsx
git commit -m "feat(ui): add cn helper + Button primitive"
```

---

### Task 4: Card, Input, Textarea primitives

**Files:**
- Create: `src/components/ui/Card.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Textarea.tsx`
- Modify: `src/app/_smoke/page.tsx`

**Interfaces:**
- Consumes: `cn` (Task 3).
- Produces:
  - `Card` — `{ raised?: boolean } & React.HTMLAttributes<HTMLDivElement>`, renders a `<div>`.
  - `Input` — `React.InputHTMLAttributes<HTMLInputElement>`, renders `<input>`.
  - `Textarea` — `React.TextareaHTMLAttributes<HTMLTextAreaElement>`, renders `<textarea>`.

- [ ] **Step 1: Write `Card`.**

```tsx
// src/components/ui/Card.tsx
import { cn } from "./cn";
export function Card({ raised, className, ...props }: { raised?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border p-6",
        raised ? "bg-surface-raised" : "bg-surface",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Write `Input` and `Textarea`.**

```tsx
// src/components/ui/Input.tsx
import { cn } from "./cn";
const field =
  "w-full bg-surface text-fg border border-border rounded-[var(--radius)] px-3 py-2 " +
  "placeholder:text-fg-muted focus:outline focus:outline-1 focus:outline-fg focus:outline-offset-2";
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, className)} {...props} />;
}
```

```tsx
// src/components/ui/Textarea.tsx
import { cn } from "./cn";
const field =
  "w-full bg-surface text-fg border border-border rounded-[var(--radius)] px-3 py-2 " +
  "placeholder:text-fg-muted focus:outline focus:outline-1 focus:outline-fg focus:outline-offset-2";
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, className)} {...props} />;
}
```

- [ ] **Step 3: Add to smoke harness.** Append a `Card` containing an `Input` and `Textarea` to `_smoke/page.tsx`.
- [ ] **Step 4: Build + render check.**

Run: `npx next build`; open `/_smoke`.
Expected: card border + surface correct; input/textarea show single-hairline focus ring on focus.

- [ ] **Step 5: Commit.**

```bash
git add src/components/ui/Card.tsx src/components/ui/Input.tsx src/components/ui/Textarea.tsx src/app/_smoke/page.tsx
git commit -m "feat(ui): add Card, Input, Textarea primitives"
```

---

### Task 5: Badge, Eyebrow, Rule, Prose primitives

**Files:**
- Create: `src/components/ui/Badge.tsx`, `src/components/ui/Eyebrow.tsx`, `src/components/ui/Rule.tsx`, `src/components/ui/Prose.tsx`
- Modify: `src/app/_smoke/page.tsx`

**Interfaces:**
- Consumes: `cn` (Task 3).
- Produces:
  - `Badge` — `{ tone?: "default" | "brand" } & React.HTMLAttributes<HTMLSpanElement>`, renders `<span>`.
  - `Eyebrow` — `React.HTMLAttributes<HTMLParagraphElement>`, renders `<p>` (uppercase micro label).
  - `Rule` — `React.HTMLAttributes<HTMLHRElement>`, renders `<hr>`.
  - `Prose` — `React.HTMLAttributes<HTMLDivElement>`, renders `<div>` with 65ch clamp.

- [ ] **Step 1: Write all four.**

```tsx
// src/components/ui/Badge.tsx
import { cn } from "./cn";
export function Badge({ tone = "default", className, ...props }: { tone?: "default" | "brand" } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[var(--fs-micro)] px-2 py-0.5 rounded-[var(--radius)] border",
        tone === "brand" ? "border-brand text-brand" : "border-border text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}
```

```tsx
// src/components/ui/Eyebrow.tsx
import { cn } from "./cn";
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[var(--fs-micro)] uppercase tracking-[0.12em] text-fg-muted", className)} {...props} />;
}
```

```tsx
// src/components/ui/Rule.tsx
import { cn } from "./cn";
export function Rule({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("border-0 h-px bg-border", className)} {...props} />;
}
```

```tsx
// src/components/ui/Prose.tsx
import { cn } from "./cn";
export function Prose({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("max-w-[65ch] leading-relaxed text-fg", className)} {...props} />;
}
```

- [ ] **Step 2: Add to smoke harness; build + render check.**

Run: `npx next build`; open `/_smoke`.
Expected: badge (both tones), uppercase eyebrow, hairline rule, clamped prose all render.

- [ ] **Step 3: Commit.**

```bash
git add src/components/ui/Badge.tsx src/components/ui/Eyebrow.tsx src/components/ui/Rule.tsx src/components/ui/Prose.tsx src/app/_smoke/page.tsx
git commit -m "feat(ui): add Badge, Eyebrow, Rule, Prose primitives"
```

---

### Task 6: `/style-guide` route (live, noindex)

**Files:**
- Create: `src/app/style-guide/page.tsx`
- Delete: `src/app/_smoke/page.tsx` (superseded)
- Check: `src/app/sitemap.ts` (or wherever the sitemap is generated) — confirm `/style-guide` is excluded

**Interfaces:**
- Consumes: every `ui/` primitive (Tasks 3–5), the tokens (Task 2).
- Produces: a single rendered reference page. No exported API.

- [ ] **Step 1: Build the page.** Sections, each reading tokens directly so it can't drift: (a) Colors — swatches for surface/surface-raised/fg/fg-muted/border/brand with hex + a computed-contrast note; (b) Type scale — one specimen line per `--fs-*` token; (c) Spacing — bars sized to each `--space-*`; (d) Components — every primitive in every variant; (e) Motion/helpers — `.rule`, focus rings, hover states. Set `noindex`:

```tsx
// src/app/style-guide/page.tsx
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rule } from "@/components/ui/Rule";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = { title: "Style Guide", robots: { index: false, follow: false } };

const SWATCHES = [
  ["surface", "--color-surface"], ["surface-raised", "--color-surface-raised"],
  ["fg", "--color-fg"], ["fg-muted", "--color-fg-muted"],
  ["border", "--color-border"], ["brand", "--color-brand"],
] as const;
const TYPE = ["micro","caption","body","lead","h3","h2","h1","hero"] as const;
const SPACE = [1,2,3,4,6,8,12,16,24,32] as const;

export default function StyleGuide() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <header><Eyebrow>DoppelWriter</Eyebrow><h1 className="text-[var(--fs-h1)]">Design System</h1></header>

      <section><h2 className="text-[var(--fs-h2)] mb-6">Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SWATCHES.map(([name, varName]) => (
            <div key={name} className="border border-border rounded-[var(--radius)] overflow-hidden">
              <div className="h-20" style={{ background: `var(${varName})` }} />
              <div className="p-3 text-[var(--fs-caption)]"><div className="text-fg">{name}</div><code className="text-fg-muted">{varName}</code></div>
            </div>
          ))}
        </div>
      </section>

      <section><h2 className="text-[var(--fs-h2)] mb-6">Type scale</h2>
        <div className="space-y-3">{TYPE.map((t) => (
          <div key={t} style={{ fontSize: `var(--fs-${t})` }} className="leading-none">{t} — The quick brown fox</div>
        ))}</div>
      </section>

      <section><h2 className="text-[var(--fs-h2)] mb-6">Spacing</h2>
        <div className="space-y-2">{SPACE.map((s) => (
          <div key={s} className="flex items-center gap-3"><code className="text-fg-muted w-16 text-[var(--fs-caption)]">space-{s}</code><div className="h-4 bg-brand" style={{ width: `var(--space-${s})` }} /></div>
        ))}</div>
      </section>

      <section><h2 className="text-[var(--fs-h2)] mb-6">Components</h2>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {(["primary","ghost","accent"] as const).map((v) => (["sm","md"] as const).map((s) => (
              <Button key={v+s} variant={v} size={s}>{v} {s}</Button>
            )))}
          </div>
          <div className="flex flex-wrap gap-3"><Badge>default</Badge><Badge tone="brand">brand</Badge></div>
          <Card><Eyebrow>Card</Eyebrow><Input placeholder="Input" className="mt-3" /><Textarea placeholder="Textarea" className="mt-3" rows={3} /></Card>
          <Card raised><Prose>Prose clamps body copy to 65ch for readability. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</Prose></Card>
          <Rule />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Delete the smoke harness.** `rm src/app/_smoke/page.tsx`.
- [ ] **Step 3: Confirm noindex + sitemap exclusion.** Inspect the sitemap source (`src/app/sitemap.ts` or equivalent). If it enumerates routes, ensure `/style-guide` is not included. Confirm `robots.index: false` is set (Step 1).
- [ ] **Step 4: Build + render check.**

Run: `npx next build`; open `/style-guide`.
Expected: all sections render; page source `<meta name="robots" content="noindex...">` present.

- [ ] **Step 5: Commit.**

```bash
git add src/app/style-guide/page.tsx
git rm src/app/_smoke/page.tsx
git commit -m "feat(design): add live /style-guide reference route (noindex)"
```

---

### Task 7: `DESIGN-SYSTEM.md` + fix stale `CLAUDE.md`

**Files:**
- Create: `DESIGN-SYSTEM.md` (repo root)
- Modify: `CLAUDE.md` (the `## Style` block)

**Interfaces:** none (docs only).

- [ ] **Step 1: Write `DESIGN-SYSTEM.md`.** Sections: brand direction (one paragraph), the token table (palette + semantic aliases + type + spacing + radii + motion, copied from `globals.css`), each primitive's props/variants, do/don'ts ("read semantic tokens only; never arbitrary hexes or raw `--color-*` palette in components"), and the three-surface model (this doc · `/style-guide` · claude.ai/design).
- [ ] **Step 2: Replace the `CLAUDE.md` `## Style` block.** Delete the `Dark theme (#0C0A09 …) Literata serif …` lines. Replace with:

```markdown
## Style
The design system is **Modern AI-product, warm** (rebranded 2026-06). Single source of truth: `DESIGN-SYSTEM.md` + the `@theme` tokens in `src/app/globals.css`. Components MUST read semantic tokens (`bg-surface`, `text-fg`, `border-border`, `bg-brand`) — never raw palette values or arbitrary hexes. Live reference: `/style-guide` (noindex). Browsable cards: claude.ai/design.
```

- [ ] **Step 3: Commit.**

```bash
git add DESIGN-SYSTEM.md CLAUDE.md
git commit -m "docs: add DESIGN-SYSTEM.md; replace stale CLAUDE.md brand block"
```

---

### Task 8: Mirror the system to the Claude app (DesignSync)

**Files:**
- Create: `claude-design/components/*.html` (one card per token group + primitive group)
- Test: visual confirmation in claude.ai/design

**Interfaces:**
- Consumes: locked tokens (Task 2), primitives (Tasks 3–5).
- Produces: browsable cards in the DoppelWriter Claude Design project.

- [ ] **Step 1: Generate self-contained HTML cards.** One file per group, each inlining the actual token values + rendered markup (so it renders without the Next build), each with a first-line `<!-- @dsCard group="…" -->` marker. Groups: `Colors`, `Type`, `Spacing`, `Buttons`, `Cards`, `Inputs`, `Badges`, `Motion`. Mirror what `/style-guide` shows for each.
- [ ] **Step 2: Push via `/design-sync` skill.** Reuse the project from Task 1. `DesignSync` `list_files` → build the diff → `finalize_plan` writing `claude-design/components/**` → `write_files` (localPath, incremental, one component group at a time — never wholesale replace).
- [ ] **Step 3: Verify in claude.ai/design.** Confirm all eight groups appear as cards and render correctly. Have Nick confirm he can browse them in the Claude app.
- [ ] **Step 4: Commit the local card sources.**

```bash
git add claude-design/
git commit -m "feat(design): mirror design system to Claude app via DesignSync cards"
```

---

## Self-Review

**Spec coverage:** Phase 0 → Task 1. Token layer + semantic aliases → Task 2. Fonts → Task 2. Primitives → Tasks 3–5. `/style-guide` noindex → Task 6. `DESIGN-SYSTEM.md` + CLAUDE.md fix → Task 7. Claude-app sync → Task 8. Verification (build + contrast) → folded into each task's render-check + Task 2 Step 5. **Deferred to Plan B (out of scope here, stated up front):** big-bang refactor of the 27 components, logo/OG/cinematic asset redo, Playwright multi-route sweep, deploy. These are correctly excluded because they depend on these primitives existing.

**Placeholder scan:** The `<hex>`/`<value>` tokens in Task 2 are not placeholders — they are an explicit data dependency consumed from Task 1's output (`TOKENS.md`), which is the legitimate purpose of the Phase-0 gate. All component code is complete and concrete.

**Type consistency:** Semantic utility names (`bg-surface`, `text-fg`, `text-fg-muted`, `border-border`, `bg-brand`, `text-brand`) are defined once in Task 2 and used identically in Tasks 3–6. Primitive signatures (`Button`/`Card`/`Input`/`Textarea`/`Badge`/`Eyebrow`/`Rule`/`Prose`) match between their definitions and their `/style-guide` consumption.

**Note for executor:** verify the `bg-fg` / `text-surface` etc. utilities actually generate — Tailwind v4 `@theme` produces `bg-*`/`text-*`/`border-*` utilities from `--color-*` tokens. If a semantic token is referenced as a utility that doesn't generate, fall back to arbitrary `bg-[var(--color-surface)]` syntax (still semantic, still allowed). Confirm during Task 3 Step 4.
