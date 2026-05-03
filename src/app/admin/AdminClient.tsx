"use client";

import { useEffect, useState, useCallback } from "react";
import { CLASSES, STAGES, TOTAL_ACTIVITIES } from "@/lib/questData";

interface SessionRow {
  id: string;
  studentName: string;
  studentClass: string;
  currentStep: number;
  xp: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, unknown>;
}

const ADMIN_KEY_STORAGE = "shacharit-admin-key";

export function AdminClient() {
  const [key, setKey] = useState<string>("");
  const [authed, setAuthed] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Hydrate key from localStorage and try auto-login
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (stored) {
      setKey(stored);
      tryLogin(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryLogin = useCallback(async (k: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sessions", { headers: { "x-admin-key": k } });
      if (res.status === 401) {
        setError("מפתח שגוי. נסי שוב.");
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        setError("שגיאת שרת. בדקי שה-DB מחובר.");
        return;
      }
      const data = await res.json();
      setSessions(data.sessions);
      setAuthed(true);
      localStorage.setItem(ADMIN_KEY_STORAGE, k);
    } catch {
      setError("שגיאת רשת.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function refresh() {
    if (!key) return;
    await tryLogin(key);
  }

  async function exportToSheets() {
    setExporting(true);
    setExportMsg(null);
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "x-admin-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setExportMsg(`❌ ${data.error || "שגיאה"}`);
        return;
      }
      setExportMsg(
        `✓ נכתבו ${data.rowsWritten} שורות (${data.sessionCount} סשנים). פתחי את הגיליון: ${data.sheetUrl}`,
      );
    } catch (e) {
      setExportMsg(`❌ שגיאת רשת`);
    } finally {
      setExporting(false);
    }
  }

  async function deleteSession(id: string, name: string) {
    if (!confirm(`למחוק את הסשן של ${name}?`)) return;
    await fetch(`/api/admin/sessions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-key": key },
    });
    refresh();
  }

  function logout() {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setAuthed(false);
    setKey("");
    setSessions(null);
  }

  if (!authed) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="glass-strong rounded-3xl p-8 max-w-sm w-full">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-2xl font-display font-black">כניסת מורה / מנהל</h1>
          <p className="text-sm text-white/60 mt-1 mb-5">הזיני את מפתח האדמין</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ADMIN_KEY"
            className="field"
            onKeyDown={(e) => {
              if (e.key === "Enter") tryLogin(key);
            }}
            autoFocus
          />
          {error && (
            <div className="mt-3 text-sm text-rose-300 bg-rose-400/10 border border-rose-400/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={() => tryLogin(key)}
            disabled={loading || !key}
            className="btn-primary w-full mt-5"
          >
            {loading ? "בודק…" : "כניסה"}
          </button>
        </div>
      </div>
    );
  }

  const stats = computeStats(sessions ?? []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-black">לוח מנהל</h1>
          <p className="text-sm text-white/60">סשני תלמידים · סך הכל {sessions?.length ?? 0}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={refresh} className="btn-ghost">↻ רענון</button>
          <button onClick={exportToSheets} disabled={exporting} className="btn-primary">
            {exporting ? "מייצא…" : "ייצוא ל-Google Sheets"}
          </button>
          <button onClick={logout} className="btn-ghost">יציאה</button>
        </div>
      </header>

      {exportMsg && (
        <div className="mt-4 glass rounded-2xl px-4 py-3 text-sm break-all">{exportMsg}</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <Stat label="סשנים סה״כ" value={String(stats.total)} />
        <Stat label="סיימו את הקוויסט" value={String(stats.completed)} accent="emerald" />
        <Stat label="ממוצע XP" value={String(stats.avgXp)} accent="amber" />
        <Stat label="ממוצע השלמה" value={`${stats.avgCompletion}%`} accent="violet" />
      </div>

      <div className="mt-8 glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-white/50 font-display">
                <Th>שם</Th>
                <Th>כיתה</Th>
                <Th>שלב</Th>
                <Th>משימות</Th>
                <Th>XP</Th>
                <Th>סטטוס</Th>
                <Th>התחיל</Th>
                <Th>פעולות</Th>
              </tr>
            </thead>
            <tbody>
              {(sessions ?? []).map((s) => {
                const completedCount = countCompleted(s.answers);
                return (
                  <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <Td className="font-semibold">{s.studentName}</Td>
                    <Td>
                      <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                        {CLASSES.find((c) => c.id === s.studentClass)?.label ?? s.studentClass}
                      </span>
                    </Td>
                    <Td>{s.currentStep}/4</Td>
                    <Td className="tabular-nums">
                      {completedCount}/{TOTAL_ACTIVITIES}
                    </Td>
                    <Td className="text-amber-300 font-bold tabular-nums">{s.xp}</Td>
                    <Td>
                      {s.completedAt ? (
                        <span className="text-xs rounded-full bg-emerald-300/15 border border-emerald-300/40 text-emerald-200 px-2 py-0.5">
                          ✓ סיים
                        </span>
                      ) : (
                        <span className="text-xs rounded-full bg-amber-300/10 border border-amber-300/30 text-amber-200 px-2 py-0.5">
                          באמצע
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs text-white/55 whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </Td>
                    <Td>
                      <button
                        onClick={() => deleteSession(s.id, s.studentName)}
                        className="text-xs text-rose-300 hover:underline"
                      >
                        מחק
                      </button>
                    </Td>
                  </tr>
                );
              })}
              {sessions?.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-white/40 py-10">
                    אין סשנים עדיין.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-right px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "violet" | "amber";
}) {
  const c =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "violet"
        ? "text-violet-300"
        : accent === "amber"
          ? "text-amber-300"
          : "text-white";
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs uppercase tracking-widest text-white/50 font-display">{label}</div>
      <div className={`text-3xl font-display font-black tabular-nums mt-1 ${c}`}>{value}</div>
    </div>
  );
}

function countCompleted(answers: Record<string, unknown>): number {
  let n = 0;
  for (const stage of STAGES) {
    for (const a of stage.activities) if (a.id in answers) n++;
  }
  return n;
}

function formatDate(s: string): string {
  try {
    const d = new Date(s.endsWith("Z") || s.includes("+") ? s : s + "Z");
    return d.toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return s;
  }
}

interface StatsResult {
  total: number;
  completed: number;
  avgXp: number;
  avgCompletion: number;
}
function computeStats(sessions: SessionRow[]): StatsResult {
  if (sessions.length === 0) return { total: 0, completed: 0, avgXp: 0, avgCompletion: 0 };
  let xpSum = 0;
  let completedCount = 0;
  let activitySum = 0;
  for (const s of sessions) {
    xpSum += s.xp;
    if (s.completedAt) completedCount++;
    activitySum += countCompleted(s.answers);
  }
  return {
    total: sessions.length,
    completed: completedCount,
    avgXp: Math.round(xpSum / sessions.length),
    avgCompletion: Math.round((activitySum / sessions.length / TOTAL_ACTIVITIES) * 100),
  };
}
