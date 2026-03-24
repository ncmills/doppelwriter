import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { editDraft } from "@/lib/editor";
import { checkUsage, logUsage } from "@/lib/usage";
import { trackServerEvent } from "@/lib/track";

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

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (usage.throttled) {
          await new Promise((r) => setTimeout(r, 2000));
        }
        let hasOutput = false;
        for await (const chunk of editDraft(draft, profileId, instructions)) {
          hasOutput = true;
          controller.enqueue(encoder.encode(chunk));
        }
        // Only log usage after successful generation
        if (hasOutput) {
          await logUsage(session.user!.id, "edit");
          trackServerEvent("edit", { profileId, wordCount: draft?.length }, session.user!.id);
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Generation failed";
        controller.enqueue(encoder.encode(`\n\n[ERROR: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
