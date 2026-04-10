// IndexNow integration. Filename of the key file in /public IS the key value.

export const INDEXNOW_KEY = "dw-9c5e2f8a4d1b7c3f6e9a2d8b5c4f1a7e";
export const INDEXNOW_HOST = "doppelwriter.com";
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/indexnow-${INDEXNOW_KEY}.txt`;
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export function buildIndexNowPayload(urls: string[]): IndexNowPayload {
  return {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  };
}

export async function submitToIndexNow(urls: string[]): Promise<{
  ok: boolean;
  status: number;
  submitted: number;
}> {
  if (urls.length === 0) return { ok: true, status: 200, submitted: 0 };
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(buildIndexNowPayload(urls)),
  });
  return { ok: res.ok, status: res.status, submitted: urls.length };
}
