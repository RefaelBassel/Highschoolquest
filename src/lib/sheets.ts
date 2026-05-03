import { google } from "googleapis";
import { findActivity, STAGES } from "./questData";

export interface SessionExportRow {
  id: string;
  studentName: string;
  studentClass: string;
  xp: number;
  completedAt: string | null;
  createdAt: string;
  answers: Record<string, unknown>;
}

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n");
  if (!key.includes("\n") && key.includes("-----BEGIN PRIVATE KEY-----")) {
    key = key
      .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
      .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----")
      .replace(/(.{64})/g, "$1\n")
      .replace(/\n+/g, "\n");
  }
  if (!key.endsWith("\n")) key += "\n";
  return key;
}

function readCredentials(): { clientEmail: string; privateKey: string } {
  // Preferred: paste the entire Service Account JSON file as a single env var.
  const jsonRaw = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON;
  if (jsonRaw && jsonRaw.trim().length > 0) {
    let parsed: { client_email?: string; private_key?: string };
    try {
      // Some platforms wrap the value in quotes.
      const trimmed = jsonRaw.trim().replace(/^['"]|['"]$/g, "");
      parsed = JSON.parse(trimmed);
    } catch (e) {
      throw new Error(
        "GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON is not valid JSON. Paste the entire contents of the Service Account JSON file as the value (open it in Notepad, Ctrl+A, Ctrl+C).",
      );
    }
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("Service Account JSON missing client_email or private_key fields.");
    }
    return {
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  }

  // Backward-compatible: separate vars.
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!clientEmail || !privateKeyRaw) {
    throw new Error(
      "Missing Sheets credentials. Set GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON (preferred) or both GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY.",
    );
  }
  const privateKey = normalizePrivateKey(privateKeyRaw);
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_SHEETS_PRIVATE_KEY does not look like a private key. Easier alternative: paste the whole JSON file into GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON instead.",
    );
  }
  return { clientEmail, privateKey };
}

function getServiceAccountAuth() {
  const { clientEmail, privateKey } = readCredentials();
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheets() {
  const auth = getServiceAccountAuth();
  return google.sheets({ version: "v4", auth });
}

/** Build the header row + a row per session. The columns include base info and one column per activity. */
export function buildExportRows(sessions: SessionExportRow[]): string[][] {
  const activityColumns: { id: string; header: string }[] = [];
  for (const stage of STAGES) {
    for (const a of stage.activities) {
      activityColumns.push({ id: a.id, header: `[שלב ${stage.number}] ${a.title}` });
    }
  }

  const header = [
    "מזהה סשן",
    "שם מלא",
    "כיתה",
    "XP",
    "סיים בתאריך",
    "התחיל בתאריך",
    ...activityColumns.map((c) => c.header),
  ];

  const rows: string[][] = [header];

  for (const s of sessions) {
    const answersRow: string[] = activityColumns.map(({ id }) => formatAnswer(id, s.answers[id]));
    rows.push([
      s.id,
      s.studentName,
      s.studentClass,
      String(s.xp),
      s.completedAt ?? "",
      s.createdAt,
      ...answersRow,
    ]);
  }

  return rows;
}

function formatAnswer(activityId: string, answer: unknown): string {
  if (answer === undefined || answer === null) return "";
  const a = findActivity(activityId);
  if (!a) return JSON.stringify(answer);

  switch (a.kind) {
    case "narrative-card":
      return "✓";
    case "multiple-choice": {
      const obj = answer as { selectedId?: string; correct?: boolean };
      const opt = a.options.find((o) => o.id === obj.selectedId);
      return `${opt?.label ?? obj.selectedId ?? ""} ${obj.correct ? "✓" : "✗"}`.trim();
    }
    case "drag-drop": {
      const obj = answer as { droppedIds?: string[]; correct?: boolean };
      const labels = (obj.droppedIds || [])
        .map((id) => a.items.find((i) => i.id === id)?.label || id)
        .join(", ");
      return `[${labels}] ${obj.correct ? "✓" : "✗"}`;
    }
    case "sort-categories": {
      const obj = answer as { placements?: Record<string, string>; correctCount?: number; total?: number };
      const lines = Object.entries(obj.placements || {}).map(([itemId, catId]) => {
        const item = a.items.find((i) => i.id === itemId)?.label || itemId;
        const cat = a.categories.find((c) => c.id === catId)?.label || catId;
        return `${item}→${cat}`;
      });
      return `${lines.join(" | ")} (${obj.correctCount ?? 0}/${obj.total ?? a.items.length})`;
    }
    case "flip-card":
    case "flip-card-deck":
      return "✓";
    case "hotspot": {
      const obj = answer as { selectedIds?: string[]; correct?: boolean };
      return `${(obj.selectedIds || []).join(",")} ${obj.correct ? "✓" : "✗"}`;
    }
    case "matching": {
      const obj = answer as { matches?: Record<string, string>; correctCount?: number; total?: number };
      const lines = Object.entries(obj.matches || {}).map(([l, r]) => {
        const lp = a.pairs.find((p) => p.id === l);
        const rp = a.pairs.find((p) => p.id === r);
        return `${lp?.left ?? l}↔${rp?.right ?? r}`;
      });
      return `${lines.join(" | ")} (${obj.correctCount ?? 0}/${obj.total ?? a.pairs.length})`;
    }
    case "open-text":
    case "external-entry": {
      const obj = answer as Record<string, string>;
      return Object.entries(obj)
        .map(([k, v]) => {
          const label = (a.fields.find((f) => f.id === k) as { label?: string } | undefined)?.label ?? k;
          return `${label}: ${v}`;
        })
        .join(" | ");
    }
    default:
      return JSON.stringify(answer);
  }
}

/** Push to a Google Sheet. The sheet must already exist and the service account must have edit access. */
export async function pushToSheet(spreadsheetId: string, rows: string[][]): Promise<{ updatedRange: string }> {
  const sheets = getSheets();
  const sheetName = `Quest_${new Date().toISOString().slice(0, 10)}`;

  // Ensure sheet exists
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === sheetName);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName, rightToLeft: true } } }],
      },
    });
  } else {
    // Clear it before writing fresh data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: sheetName,
    });
  }

  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  // Light formatting: bold header row
  try {
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = sheetMeta.data.sheets?.find((s) => s.properties?.title === sheetName)?.properties?.sheetId;
    if (typeof sheetId === "number") {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.06, green: 0.05, blue: 0.12 },
                    horizontalAlignment: "RIGHT",
                  },
                },
                fields: "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)",
              },
            },
            { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: "gridProperties.frozenRowCount" } },
          ],
        },
      });
    }
  } catch (e) {
    // formatting failure shouldn't fail the export
    console.warn("sheet formatting failed", e);
  }

  return { updatedRange: res.data.updatedRange ?? `${sheetName}!A1` };
}
