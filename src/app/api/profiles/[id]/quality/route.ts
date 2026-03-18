import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assessProfileQuality } from "@/lib/profile-quality";

export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quality = await assessProfileQuality(Number(id));
  return NextResponse.json(quality);
}
