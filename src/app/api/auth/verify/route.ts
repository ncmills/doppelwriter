import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
  }

  const result = await verifyEmail(token);

  if (result.success) {
    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  } else {
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
  }
}
