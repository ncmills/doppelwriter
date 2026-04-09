import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { research } from "@/lib/generator";
import { checkUsage, checkRateLimit, logUsage } from "@/lib/usage";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = await checkRateLimit(session.user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const usage = await checkUsage(session.user.id);
  if (!usage.allowed) {
    return NextResponse.json({ error: "Monthly limit reached. Upgrade to Pro.", upgrade: true }, { status: 403 });
  }

  let query: string;
  try {
    const body = await request.json();
    query = body.query;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const result = await research(query);
  await logUsage(session.user.id, "research");
  return NextResponse.json({ research: result });
}
