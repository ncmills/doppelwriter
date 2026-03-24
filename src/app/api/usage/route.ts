import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkUsage } from "@/lib/usage";
import { isEmailVerified } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [usage, emailVerified] = await Promise.all([
    checkUsage(session.user.id),
    isEmailVerified(session.user.id),
  ]);
  return NextResponse.json({ ...usage, emailVerified });
}
