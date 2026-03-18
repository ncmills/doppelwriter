import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { editDraft } from "@/lib/editor";
import { checkUsage, logUsage } from "@/lib/usage";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const usage = await checkUsage(session.user.id);
  if (!usage.allowed) {
    return new Response(
      JSON.stringify({ error: "You've hit your monthly limit. Upgrade to Pro for 200 uses/month.", upgrade: true }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const { draft, profileId, instructions } = await request.json();
  if (!draft || !profileId) {
    return new Response(JSON.stringify({ error: "Missing draft or profileId" }), { status: 400 });
  }

  await logUsage(session.user.id, "edit");

  // If throttled (Pro user past soft cap), use smaller model or add delay
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (usage.throttled) {
          // 2s delay for throttled users to discourage abuse
          await new Promise((r) => setTimeout(r, 2000));
        }
        for await (const chunk of editDraft(draft, profileId, instructions)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
