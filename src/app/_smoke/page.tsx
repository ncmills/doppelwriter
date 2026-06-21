// src/app/_smoke/page.tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function Smoke() {
  return (
    <main className="p-12 flex flex-wrap gap-4">
      {(["primary", "ghost", "accent"] as const).map((v) =>
        (["sm", "md"] as const).map((s) => (
          <Button key={v + s} variant={v} size={s}>
            {v} {s}
          </Button>
        )),
      )}
      <Card className="max-w-md">
        <Input placeholder="Email address" />
        <Textarea className="mt-4" placeholder="Your message" rows={3} />
      </Card>
    </main>
  );
}
