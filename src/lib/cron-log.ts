// cron-log.ts — wraps a Vercel cron GET handler so every run leaves exactly one log line.
//
// Vercel runtime logs record only console output. These cron handlers print nothing on
// success or on a 401, so the runtime log history cannot show whether a given scheduled
// run happened at all. `withCronLog` fixes that: one line per invocation, with the
// response status and elapsed time, and nothing else — never headers, never the auth
// value, never the request body, never env values.

export function withCronLog<A extends unknown[], R extends Response>(
  name: string,
  handler: (...args: A) => Promise<R>
): (...args: A) => Promise<R> {
  return async (...args: A): Promise<R> => {
    const start = Date.now();
    try {
      const res = await handler(...args);
      const elapsed = Date.now() - start;
      console.log(`[cron] ${name} status=${res.status} ms=${elapsed}`);
      return res;
    } catch (err) {
      const elapsed = Date.now() - start;
      console.error(`[cron] ${name} status=throw ms=${elapsed}`);
      throw err;
    }
  };
}
