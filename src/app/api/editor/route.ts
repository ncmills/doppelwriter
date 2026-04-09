import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { editDraft } from "@/lib/editor";
import { checkUsage, checkRateLimit, logUsage, verifyProfileAccess } from "@/lib/usage";
import { trackServerEvent } from "@/lib/track";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const rateLimit = await checkRateLimit(session.user.id);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429 }
    );
  }

  const usage = await checkUsage(session.user.id);
  if (!usage.allowed) {
    return new Response(
      JSON.stringify({ error: "You've hit your monthly limit. Upgrade to Pro for 200 uses/month.", upgrade: true }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let draft: string, profileId: number, instructions: string | undefined;
  try {
    const body = await request.json();
    draft = body.draft;
    profileId = body.profileId;
    instructions = body.instructions;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }
  if (!draft || !profileId) {
    return new Response(JSON.stringify({ error: "Missing draft or profileId" }), { status: 400 });
  }
  if (draft.length > 50000) {
    return new Response(JSON.stringify({ error: "Input too long" }), { status: 400 });
  }

  if (!(await verifyProfileAccess(session.user.id, profileId))) {
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
        console.error("Editor stream error:", err);
        controller.enqueue(encoder.encode(`\n\n[ERROR: An error occurred. Please try again.]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
