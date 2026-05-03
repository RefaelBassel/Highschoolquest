import { NextResponse, type NextRequest } from "next/server";
import { ensureSchema, getDb, rowToSession } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await ensureSchema();
    const db = getDb();
    const res = await db.execute(
      `SELECT id, student_name, student_class, current_step, xp, completed_at, created_at, updated_at, answers
       FROM sessions
       ORDER BY datetime(created_at) DESC
       LIMIT 500`,
    );
    const sessions = res.rows.map((r) => {
      const row = rowToSession(r as unknown as Record<string, unknown>);
      return {
        id: row.id,
        studentName: row.student_name,
        studentClass: row.student_class,
        currentStep: row.current_step,
        xp: row.xp,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        answers: JSON.parse(row.answers || "{}"),
      };
    });
    return NextResponse.json({ sessions });
  } catch (e) {
    console.error("admin/sessions error", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await ensureSchema();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
    const db = getDb();
    await db.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin/sessions DELETE error", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
