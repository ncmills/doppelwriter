import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { research } from "@/lib/generator";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query } = await request.json();
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const result = await research(query);
  return NextResponse.json({ research: result });
}
