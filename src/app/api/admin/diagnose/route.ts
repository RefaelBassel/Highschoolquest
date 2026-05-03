import { NextResponse, type NextRequest } from "next/server";
import { google } from "googleapis";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result: Record<string, unknown> = {
    env: {
      hasJson: !!process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON,
      jsonLen: process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON?.length ?? 0,
      hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "(not set)",
    },
  };

  // Parse the SA credentials and report what we see (no secrets).
  try {
    const jsonRaw = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON;
    if (jsonRaw && jsonRaw.trim().length > 0) {
      const trimmed = jsonRaw.trim().replace(/^['"]|['"]$/g, "");
      const parsed = JSON.parse(trimmed);
      result.parsedFromJson = {
        type: parsed.type,
        project_id: parsed.project_id,
        client_email: parsed.client_email,
        client_id: parsed.client_id,
        private_key_starts_with: String(parsed.private_key || "").slice(0, 35),
        private_key_ends_with: String(parsed.private_key || "").slice(-30),
      };
    }
  } catch (e) {
    result.parseError = e instanceof Error ? e.message : String(e);
  }

  // Try to fetch the spreadsheet metadata
  try {
    const { google: g } = { google };
    const auth = await loadAuth();
    const sheets = g.sheets({ version: "v4", auth });
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      fields: "spreadsheetId,properties.title,sheets.properties.title",
    });
    result.spreadsheetCheck = {
      ok: true,
      spreadsheetId: meta.data.spreadsheetId,
      title: meta.data.properties?.title,
      sheets: meta.data.sheets?.map((s) => s.properties?.title),
    };
  } catch (e) {
    const err = e as { message?: string; code?: number; response?: { data?: unknown } };
    result.spreadsheetCheck = {
      ok: false,
      message: err.message,
      code: err.code,
      data: err.response?.data,
    };
  }

  return NextResponse.json(result, { status: 200 });
}

async function loadAuth() {
  const jsonRaw = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON;
  if (jsonRaw) {
    const trimmed = jsonRaw.trim().replace(/^['"]|['"]$/g, "");
    const parsed = JSON.parse(trimmed);
    return new google.auth.JWT({
      email: parsed.client_email,
      key: parsed.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  throw new Error("no JSON env var present");
}
