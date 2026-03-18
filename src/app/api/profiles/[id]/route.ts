import { NextRequest, NextResponse } from "next/server";
import { getProfile, updateProfile, generateProfile } from "@/lib/style-analyzer";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const profile = await getProfile(Number(id));
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  await updateProfile(Number(id), body);

  if (body.regenerate) {
    await generateProfile(Number(id));
  }

  const profile = await getProfile(Number(id));
  return NextResponse.json(profile);
}
