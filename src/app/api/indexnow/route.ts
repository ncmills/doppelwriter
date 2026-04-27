import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const INDEXNOW_HOST = "https://api.indexnow.org";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.email !== "nick@doppelwriter.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: "INDEXNOW_KEY not configured" }, { status: 500 });
  }

  let urls: string[];
  try {
    const body = await req.json();
    urls = body.urls;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!urls || !Array.isArray(urls)) {
    return NextResponse.json({ error: "urls array required" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${INDEXNOW_HOST}/indexnow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: "doppelwriter.com",
        key: INDEXNOW_KEY,
        keyLocation: `https://doppelwriter.com/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "TimeoutError";
    return NextResponse.json(
      { error: aborted ? "IndexNow timeout" : "IndexNow request failed" },
      { status: 504 }
    );
  }

  return NextResponse.json({
    status: res.status,
    submitted: urls.length,
    message: res.status === 200 || res.status === 202 ? "Submitted" : "Error",
  });
}
