import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const INDEXNOW_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
const INDEXNOW_HOST = "https://api.indexnow.org";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.email !== "nick@doppelwriter.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { urls } = await req.json();
  if (!urls || !Array.isArray(urls)) {
    return NextResponse.json({ error: "urls array required" }, { status: 400 });
  }

  const res = await fetch(`${INDEXNOW_HOST}/indexnow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: "doppelwriter.com",
      key: INDEXNOW_KEY,
      keyLocation: `https://doppelwriter.com/${INDEXNOW_KEY}.txt`,
      urlList: urls.slice(0, 10000),
    }),
  });

  return NextResponse.json({
    status: res.status,
    submitted: urls.length,
    message: res.status === 200 || res.status === 202 ? "Submitted" : "Error",
  });
}
