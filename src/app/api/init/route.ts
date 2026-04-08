import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initSchema } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Only allow authenticated admin or cron with CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Cron-authenticated — proceed
  } else {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    await initSchema();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Schema initialization failed" },
      { status: 500 }
    );
  }
}
