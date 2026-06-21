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
