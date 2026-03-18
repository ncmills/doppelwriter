import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfiles, analyzeAndCategorize } from "@/lib/style-analyzer";

export const maxDuration = 120;

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const profiles = await getProfiles(session.user.id);
  return NextResponse.json(profiles);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await request.json();

  if (action === "analyze") {
    const result = await analyzeAndCategorize(session.user.id);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
