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
import { Reveal } from "@/components/ui/motion/Reveal";
import { Stagger } from "@/components/ui/motion/Stagger";
import { HoverLift } from "@/components/ui/motion/HoverLift";

export const metadata: Metadata = {
  title: "Style Guide",
  robots: { index: false, follow: false },
};

const SWATCHES = [
  ["surface", "--color-surface"],
  ["surface-raised", "--color-surface-raised"],
  ["fg", "--color-fg"],
  ["fg-muted", "--color-fg-muted"],
  ["border", "--color-border"],
  ["brand", "--color-brand"],
] as const;

const TYPE = ["micro", "caption", "body", "lead", "h3", "h2", "h1", "hero"] as const;
const SPACE = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32] as const;

export default function StyleGuide() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      {/* ── Header ── */}
      <header>
        <Eyebrow>DoppelWriter</Eyebrow>
        <h1 className="text-[length:var(--fs-h1)] text-[var(--color-fg)]">Design System</h1>
      </header>

      {/* ── (a) Colors ── */}
      <section>
        <h2 className="text-[length:var(--fs-h2)] text-[var(--color-fg)] mb-6">Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SWATCHES.map(([name, varName]) => (
            <div
              key={name}
              className="border border-[var(--color-border)] rounded-[var(--radius)] overflow-hidden"
            >
              <div className="h-20" style={{ background: `var(${varName})` }} />
              <div className="p-3 text-[length:var(--fs-caption)]">
                <div className="text-[var(--color-fg)] font-medium">{name}</div>
                <code className="text-[var(--color-fg-muted)]">{varName}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Rule />

      {/* ── (b) Type scale ── */}
      <section>
        <h2 className="text-[length:var(--fs-h2)] text-[var(--color-fg)] mb-6">Type scale</h2>
        <div className="space-y-4">
          {TYPE.map((t) => (
            <div key={t} className="flex items-baseline gap-4">
              <code className="text-[var(--color-fg-muted)] w-16 shrink-0" style={{ fontSize: "var(--fs-caption)" }}>
                {t}
              </code>
              <div
                className="text-[var(--color-fg)] leading-none"
                style={{ fontSize: `var(--fs-${t})` }}
              >
                The quick brown fox
              </div>
            </div>
          ))}
        </div>
      </section>

      <Rule />

      {/* ── (c) Spacing ── */}
      <section>
        <h2 className="text-[length:var(--fs-h2)] text-[var(--color-fg)] mb-6">Spacing</h2>
        <div className="space-y-3">
          {SPACE.map((s) => (
            <div key={s} className="flex items-center gap-4">
              <code
                className="text-[var(--color-fg-muted)] w-20 shrink-0"
                style={{ fontSize: "var(--fs-caption)" }}
              >
                space-{s}
              </code>
              <div
                className="h-4 bg-[var(--color-brand)] rounded-sm"
                style={{ width: `var(--space-${s})` }}
              />
            </div>
          ))}
        </div>
      </section>

      <Rule />

      {/* ── (d) Components ── */}
      <section>
        <h2 className="text-[length:var(--fs-h2)] text-[var(--color-fg)] mb-6">Components</h2>
        <div className="space-y-8">
          {/* Buttons */}
          <div>
            <Eyebrow>Buttons</Eyebrow>
            <div className="flex flex-wrap gap-3 mt-3">
              {(["primary", "ghost", "accent"] as const).map((v) =>
                (["sm", "md"] as const).map((s) => (
                  <Button key={v + s} variant={v} size={s}>
                    {v} {s}
                  </Button>
                )),
              )}
            </div>
          </div>

          {/* Badges */}
          <div>
            <Eyebrow>Badges</Eyebrow>
            <div className="flex flex-wrap gap-3 mt-3">
              <Badge>default</Badge>
              <Badge tone="brand">brand</Badge>
            </div>
          </div>

          {/* Card with form elements */}
          <div>
            <Eyebrow>Card + Input + Textarea</Eyebrow>
            <Card className="mt-3 max-w-md">
              <Eyebrow>Card label</Eyebrow>
              <Input placeholder="Input placeholder" className="mt-3" />
              <Textarea placeholder="Textarea placeholder" className="mt-3" rows={3} />
            </Card>
          </div>

          {/* Raised Card + Prose */}
          <div>
            <Eyebrow>Raised Card + Prose</Eyebrow>
            <Card raised className="mt-3 max-w-prose">
              <Prose>
                Prose clamps body copy to 65ch for readability. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                magna aliqua.
              </Prose>
            </Card>
          </div>

          {/* Rule */}
          <div>
            <Eyebrow>Rule</Eyebrow>
            <Rule className="mt-3" />
          </div>
        </div>
      </section>

      <Rule />

      {/* ── (e) Motion playground ── */}
      <section>
        <h2 className="text-[length:var(--fs-h2)] text-[var(--color-fg)] mb-2">Motion playground</h2>
        <p className="text-[var(--color-fg-muted)] text-[length:var(--fs-caption)] mb-8">
          All motion honors <code>prefers-reduced-motion</code> — Framer Motion disables animations
          when the OS setting is active.
        </p>

        {/* Stagger + Reveal */}
        <div className="space-y-6">
          <div>
            <Eyebrow className="mb-4">Stagger + Reveal — animates on scroll-in</Eyebrow>
            <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Reveal>
                <Card>
                  <p className="text-[length:var(--fs-body)] text-[var(--color-fg)] font-medium">
                    Reveal card 1
                  </p>
                  <p className="text-[length:var(--fs-caption)] text-[var(--color-fg-muted)] mt-1">
                    Fades and rises on scroll-in
                  </p>
                </Card>
              </Reveal>
              <Reveal delay={0.06}>
                <Card>
                  <p className="text-[length:var(--fs-body)] text-[var(--color-fg)] font-medium">
                    Reveal card 2
                  </p>
                  <p className="text-[length:var(--fs-caption)] text-[var(--color-fg-muted)] mt-1">
                    Staggered 60 ms later
                  </p>
                </Card>
              </Reveal>
              <Reveal delay={0.12}>
                <Card>
                  <p className="text-[length:var(--fs-body)] text-[var(--color-fg)] font-medium">
                    Reveal card 3
                  </p>
                  <p className="text-[length:var(--fs-caption)] text-[var(--color-fg-muted)] mt-1">
                    Staggered 120 ms later
                  </p>
                </Card>
              </Reveal>
            </Stagger>
          </div>

          {/* HoverLift */}
          <div>
            <Eyebrow className="mb-4">HoverLift — hover the card below</Eyebrow>
            <HoverLift className="max-w-xs cursor-pointer">
              <Card raised>
                <p className="text-[length:var(--fs-body)] text-[var(--color-fg)] font-medium">
                  Hover me — spring lift
                </p>
                <p className="text-[length:var(--fs-caption)] text-[var(--color-fg-muted)] mt-1">
                  translateY springs to −3px on hover, returns on tap
                </p>
              </Card>
            </HoverLift>
          </div>
        </div>
      </section>

      {/* Spacer so scroll-triggered reveals actually fire in short viewports */}
      <div className="h-32" />
    </main>
  );
}
