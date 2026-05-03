import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { ensureSchema, getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const studentName = String(body?.studentName ?? "").trim();
    const studentClass = String(body?.studentClass ?? "").trim();

    if (studentName.length < 2) {
      return NextResponse.json({ error: "studentName too short" }, { status: 400 });
    }
    if (!["ט", "י", "יא", "יב"].includes(studentClass)) {
      return NextResponse.json({ error: "invalid studentClass" }, { status: 400 });
    }

    const id = nanoid(12);
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO sessions (id, student_name, student_class, current_step, xp, answers, updated_at)
            VALUES (?, ?, ?, 1, 0, '{}', datetime('now'))`,
      args: [id, studentName, studentClass],
    });

    return NextResponse.json({ id, studentName, studentClass, currentStep: 1, xp: 0, answers: {} });
  } catch (e) {
    console.error("POST /api/session error", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
