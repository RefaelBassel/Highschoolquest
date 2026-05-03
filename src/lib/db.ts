import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  _client = createClient({ url, authToken });
  return _client;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  answers TEXT NOT NULL DEFAULT '{}',
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_class ON sessions(student_class);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON sessions(completed_at);
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

let _initialized = false;

export async function ensureSchema() {
  if (_initialized) return;
  const db = getDb();
  // executeMultiple isn't available on http client; run statements separately.
  for (const stmt of SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
    await db.execute(stmt);
  }
  _initialized = true;
}

export interface SessionRow {
  id: string;
  student_name: string;
  student_class: string;
  current_step: number;
  xp: number;
  answers: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToSession(row: Record<string, unknown>): SessionRow {
  return {
    id: String(row.id),
    student_name: String(row.student_name),
    student_class: String(row.student_class),
    current_step: Number(row.current_step),
    xp: Number(row.xp),
    answers: String(row.answers ?? "{}"),
    completed_at: row.completed_at ? String(row.completed_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
