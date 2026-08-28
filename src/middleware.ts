import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isPublicPath } from "@/lib/public-paths";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Redirect old dashboard to home
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Redirect old doppelwrite to write
  if (pathname === "/doppelwrite" || pathname.startsWith("/doppelwrite/")) {
    return NextResponse.redirect(new URL("/write", req.url));
  }

  // Redirect old apostrophe-containing slug to cleaned version
  if (pathname === "/write-like/conan-o'brien") {
    return NextResponse.redirect(new URL("/write-like/conan-obrien", req.url), 301);
  }

  const isPublic = isPublicPath(pathname);
  const isStatic =
    pathname.startsWith("/_next") || pathname.includes("favicon") ||
    pathname === "/robots.txt" || pathname === "/sitemap.xml" ||
    pathname.endsWith(".png") || pathname.endsWith(".jpg") || pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") || pathname.endsWith(".webp") ||
    pathname.endsWith(".txt") || // llms.txt + indexnow key files in /public/
    pathname.includes("opengraph-image") || pathname.includes("twitter-image");

  if (isStatic || isPublic) return NextResponse.next();

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
