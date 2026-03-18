import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = [
  "/",
  "/pricing",
  "/login",
  "/signup",
  "/write-like",
  "/write",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/gmail/callback",
  "/api/init",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isStatic =
    pathname.startsWith("/_next") || pathname.includes("favicon") ||
    pathname === "/robots.txt" || pathname === "/sitemap.xml";

  if (isStatic || isPublic) return NextResponse.next();

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
