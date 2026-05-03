import { NextResponse, type NextRequest } from "next/server";
import { ensureSchema, getDb, rowToSession } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function loadSession(id: string) {
  const db = getDb();
  const res = await db.execute({
    sql: `SELECT * FROM sessions WHERE id = ? LIMIT 1`,
    args: [id],
  });
  if (res.rows.length === 0) return null;
  return rowToSession(res.rows[0] as unknown as Record<string, unknown>);
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/session/[id]">) {
  try {
    await ensureSchema();
    const { id } = await ctx.params;
    const row = await loadSession(id);
    if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({
      id: row.id,
      studentName: row.student_name,
      studentClass: row.student_class,
      currentStep: row.current_step,
      xp: row.xp,
      answers: JSON.parse(row.answers || "{}"),
      completedAt: row.completed_at,
    });
  } catch (e) {
    console.error("GET /api/session/[id] error", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/session/[id]">) {
  try {
    await ensureSchema();
    const { id } = await ctx.params;
    const body = await req.json();

    const row = await loadSession(id);
    if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (typeof body.currentStep === "number") {
      updates.push("current_step = ?");
      args.push(body.currentStep);
    }
    if (typeof body.xp === "number") {
      updates.push("xp = ?");
      args.push(body.xp);
    }
    if (body.answers && typeof body.answers === "object") {
      // merge with existing answers
      const existing = JSON.parse(row.answers || "{}");
      const merged = { ...existing, ...body.answers };
      updates.push("answers = ?");
      args.push(JSON.stringify(merged));
    }
    if (body.completed === true) {
      updates.push("completed_at = datetime('now')");
    }

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, noop: true });
    }

    updates.push("updated_at = datetime('now')");
    args.push(id);

    const db = getDb();
    await db.execute({
      sql: `UPDATE sessions SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    const updated = await loadSession(id);
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({
      id: updated.id,
      currentStep: updated.current_step,
      xp: updated.xp,
      answers: JSON.parse(updated.answers || "{}"),
      completedAt: updated.completed_at,
    });
  } catch (e) {
    console.error("PATCH /api/session/[id] error", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
