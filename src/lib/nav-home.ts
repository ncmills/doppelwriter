// Where the app nav's logo goes. /home needs a session (middleware sends
// signed-out visitors to /login), so anyone not signed in goes back to "/".
export function navHomeHref(status: "authenticated" | "loading" | "unauthenticated"): string {
  return status === "authenticated" ? "/home" : "/";
}
