import type { NextRequest } from "next/server";
import { ensureSchema, getDb } from "./db";

/** Constant-time comparison */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

const ADMIN_KEY_SETTING = "admin_key";

/** Cache the active key briefly to avoid a DB hit on every API call. */
let _cache: { key: string | null; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function getActiveAdminKey(): Promise<string | null> {
  const now = Date.now();
  if (_cache && _cache.expiresAt > now) return _cache.key;

  let dbKey: string | null = null;
  try {
    await ensureSchema();
    const db = getDb();
    const res = await db.execute({
      sql: "SELECT value FROM admin_settings WHERE key = ?",
      args: [ADMIN_KEY_SETTING],
    });
    if (res.rows.length > 0) {
      dbKey = String(res.rows[0].value);
    }
  } catch {
    // ignore — fall back to env var
  }

  const active = dbKey ?? process.env.ADMIN_KEY ?? null;
  _cache = { key: active, expiresAt: now + CACHE_TTL_MS };
  return active;
}

export function invalidateAdminKeyCache() {
  _cache = null;
}

/** Persist a new admin key in the DB, overriding the env var fallback. */
export async function setAdminKey(newKey: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO admin_settings (key, value, updated_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    args: [ADMIN_KEY_SETTING, newKey],
  });
  invalidateAdminKeyCache();
}

export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  const expected = await getActiveAdminKey();
  if (!expected) return false;

  const headerKey = req.headers.get("x-admin-key");
  if (headerKey && safeEqual(headerKey, expected)) return true;

  const urlKey = req.nextUrl.searchParams.get("key");
  if (urlKey && safeEqual(urlKey, expected)) return true;

  const cookieKey = req.cookies.get("admin_key")?.value;
  if (cookieKey && safeEqual(cookieKey, expected)) return true;

  return false;
}
