import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkUsage } from "@/lib/usage";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usage = await checkUsage(session.user.id);
  return NextResponse.json(usage);
}
