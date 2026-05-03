import type { NextRequest } from "next/server";

/** Constant-time comparison */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function isAdminAuthorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return false;

  // Try header first
  const headerKey = req.headers.get("x-admin-key");
  if (headerKey && safeEqual(headerKey, expected)) return true;

  // Then query string ?key=
  const urlKey = req.nextUrl.searchParams.get("key");
  if (urlKey && safeEqual(urlKey, expected)) return true;

  // Then cookie (set by /admin login form)
  const cookieKey = req.cookies.get("admin_key")?.value;
  if (cookieKey && safeEqual(cookieKey, expected)) return true;

  return false;
}
