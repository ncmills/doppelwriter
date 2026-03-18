import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { reviseDraft } from "@/lib/editor";
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
      JSON.stringify({ error: "Monthly limit reached. Upgrade to Pro.", upgrade: true }),
      { status: 429 }
    );
  }

  const { original, currentEdit, feedback, profileId } = await request.json();
  await logUsage(session.user.id, "revise");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (usage.throttled) {
          await new Promise((r) => setTimeout(r, 2000));
        }
        for await (const chunk of reviseDraft(original, currentEdit, feedback, profileId)) {
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
