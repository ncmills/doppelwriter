// src/app/_smoke/page.tsx
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

export default function Smoke() {
  return (
    <main className="p-12 flex flex-col gap-8">
      <section className="flex flex-wrap gap-4">
        {(["primary", "ghost", "accent"] as const).map((v) =>
          (["sm", "md"] as const).map((s) => (
            <Button key={v + s} variant={v} size={s}>
              {v} {s}
            </Button>
          )),
        )}
      </section>

      <Card className="max-w-md">
        <Input placeholder="Email address" />
        <Textarea className="mt-4" placeholder="Your message" rows={3} />
      </Card>

      <Rule />

      <section className="flex flex-wrap gap-3">
        <Badge tone="default">Default badge</Badge>
        <Badge tone="brand">Brand badge</Badge>
      </section>

      <Eyebrow>Section heading eyebrow</Eyebrow>

      <Rule />

      <Prose>
        <p>
          Prose component clamps to 65ch for comfortable reading. This
          paragraph demonstrates the max-width constraint, relaxed line height,
          and the foreground color token applied via arbitrary Tailwind value
          syntax.
        </p>
      </Prose>

      <Rule />

      {/* ── Motion primitives smoke test ── */}
      <Eyebrow>Motion — Stagger + Reveal (scroll down to trigger)</Eyebrow>

      <Stagger className="flex flex-col gap-4 max-w-md">
        <Reveal>
          <Card>
            <p className="text-sm">Reveal card 1 — fades + rises on scroll-in</p>
          </Card>
        </Reveal>
        <Reveal delay={0.06}>
          <Card>
            <p className="text-sm">Reveal card 2 — staggered 60 ms later</p>
          </Card>
        </Reveal>
        <Reveal delay={0.12}>
          <Card>
            <p className="text-sm">Reveal card 3 — staggered 120 ms later</p>
          </Card>
        </Reveal>
      </Stagger>

      <Rule />

      <Eyebrow>Motion — HoverLift (hover the card below)</Eyebrow>

      <HoverLift className="max-w-xs cursor-pointer">
        <Card>
          <p className="text-sm font-medium">Hover me — spring lift</p>
          <p className="text-xs opacity-60 mt-1">translateY springs to −3px on hover, back on tap</p>
        </Card>
      </HoverLift>

      {/* Spacer so scroll-triggered reveals actually fire */}
      <div className="h-64" />
    </main>
  );
}
