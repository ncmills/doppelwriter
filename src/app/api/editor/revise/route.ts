import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { reviseDraft } from "@/lib/editor";
import { checkUsage, logUsage, verifyProfileAccess } from "@/lib/usage";

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

  if (profileId && !(await verifyProfileAccess(session.user.id, profileId))) {
    return new Response(JSON.stringify({ error: "Profile not found" }), { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (usage.throttled) {
          await new Promise((r) => setTimeout(r, 2000));
        }
        let hasOutput = false;
        for await (const chunk of reviseDraft(original, currentEdit, feedback, profileId)) {
          hasOutput = true;
          controller.enqueue(encoder.encode(chunk));
        }
        // Only log usage after successful generation
        if (hasOutput) {
          await logUsage(session.user!.id, "revise");
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Revision failed";
        controller.enqueue(encoder.encode(`\n\n[ERROR: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
