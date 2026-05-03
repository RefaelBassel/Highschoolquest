import { NextResponse, type NextRequest } from "next/server";
import { ensureSchema, getDb, rowToSession } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { buildExportRows, pushToSheet, type SessionExportRow } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const overrideSpreadsheetId =
      typeof body?.spreadsheetId === "string" && body.spreadsheetId.trim().length > 0
        ? body.spreadsheetId.trim()
        : undefined;
    const spreadsheetId = overrideSpreadsheetId ?? process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_SPREADSHEET_ID is not configured (and no override sent)" },
        { status: 400 },
      );
    }

    await ensureSchema();
    const db = getDb();
    const res = await db.execute(
      `SELECT id, student_name, student_class, xp, completed_at, created_at, answers
       FROM sessions
       ORDER BY datetime(created_at) DESC`,
    );
    const sessions: SessionExportRow[] = res.rows.map((r) => {
      const row = rowToSession(r as unknown as Record<string, unknown>);
      return {
        id: row.id,
        studentName: row.student_name,
        studentClass: row.student_class,
        xp: row.xp,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        answers: JSON.parse(row.answers || "{}"),
      };
    });

    const rows = buildExportRows(sessions);
    const result = await pushToSheet(spreadsheetId, rows);

    return NextResponse.json({
      ok: true,
      sessionCount: sessions.length,
      rowsWritten: rows.length,
      updatedRange: result.updatedRange,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    });
  } catch (e) {
    console.error("admin/export error", e);
    const msg = e instanceof Error ? e.message : "server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
