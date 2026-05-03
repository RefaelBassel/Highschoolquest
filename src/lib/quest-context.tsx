"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { findActivity, STAGES, TOTAL_XP, TOTAL_ACTIVITIES } from "./questData";

const STORAGE_KEY = "shacharit-quest-session";

export interface QuestSession {
  id: string;
  studentName: string;
  studentClass: string; // 'ט' | 'י' | 'יא' | 'יב'
  currentStep: 1 | 2 | 3 | 4;
  xp: number;
  answers: Record<string, unknown>; // keyed by activity id
  completedActivities: string[]; // activity ids that have been completed
  completedAt?: string | null;
}

export interface QuestContextValue {
  session: QuestSession | null;
  loading: boolean;
  error: string | null;
  startSession: (name: string, klass: string) => Promise<void>;
  resumeSession: (id: string) => Promise<void>;
  resetSession: () => void;
  completeActivity: (activityId: string, answer: unknown, xp: number) => void;
  goToStep: (step: 1 | 2 | 3 | 4) => void;
  markCompleted: () => Promise<void>;
  totalXp: number;
  totalActivities: number;
  progressPct: number;
}

const QuestContext = createContext<QuestContextValue | null>(null);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<QuestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Hydrate from localStorage on mount, then refresh from server ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (!stored) {
          setLoading(false);
          return;
        }
        const local = JSON.parse(stored) as QuestSession;
        // Optimistic hydrate
        if (mounted) setSession(local);

        // Refresh from server (best-effort)
        try {
          const res = await fetch(`/api/session/${local.id}`, { cache: "no-store" });
          if (res.ok) {
            const remote = (await res.json()) as {
              id: string;
              studentName: string;
              studentClass: string;
              currentStep: number;
              xp: number;
              answers: Record<string, unknown>;
              completedAt: string | null;
            };
            if (mounted) {
              setSession({
                id: remote.id,
                studentName: remote.studentName,
                studentClass: remote.studentClass,
                currentStep: clampStep(remote.currentStep),
                xp: remote.xp,
                answers: remote.answers || {},
                completedActivities: deriveCompleted(remote.answers || {}),
                completedAt: remote.completedAt,
              });
            }
          } else if (res.status === 404) {
            // server lost it — clear local
            if (mounted) {
              localStorage.removeItem(STORAGE_KEY);
              setSession(null);
            }
          }
        } catch {
          // network error — keep local
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- Persist to localStorage on every change ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  // ---- Debounced server save ----
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string | null>(null);

  const scheduleSave = useCallback((s: QuestSession) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const snapshot = JSON.stringify({
        currentStep: s.currentStep,
        xp: s.xp,
        answers: s.answers,
      });
      if (snapshot === lastSaved.current) return;
      try {
        await fetch(`/api/session/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: snapshot,
        });
        lastSaved.current = snapshot;
      } catch {
        // ignore — local copy is the source of truth
      }
    }, 600);
  }, []);

  const startSession = useCallback(async (name: string, klass: string) => {
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: name.trim(), studentClass: klass }),
      });
      if (!res.ok) {
        const msg = await safeError(res);
        setError(msg);
        return;
      }
      const data = await res.json();
      const fresh: QuestSession = {
        id: data.id,
        studentName: data.studentName,
        studentClass: data.studentClass,
        currentStep: 1,
        xp: 0,
        answers: {},
        completedActivities: [],
        completedAt: null,
      };
      setSession(fresh);
    } catch (e) {
      console.error(e);
      setError("שגיאת רשת — נסי שוב.");
    }
  }, []);

  const resumeSession = useCallback(async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/session/${id}`, { cache: "no-store" });
      if (!res.ok) {
        setError("לא נמצא סשן עם המזהה הזה.");
        return;
      }
      const remote = await res.json();
      setSession({
        id: remote.id,
        studentName: remote.studentName,
        studentClass: remote.studentClass,
        currentStep: clampStep(remote.currentStep),
        xp: remote.xp,
        answers: remote.answers || {},
        completedActivities: deriveCompleted(remote.answers || {}),
        completedAt: remote.completedAt,
      });
    } catch {
      setError("שגיאת רשת — נסי שוב.");
    }
  }, []);

  const resetSession = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    lastSaved.current = null;
  }, []);

  const completeActivity = useCallback(
    (activityId: string, answer: unknown, xp: number) => {
      setSession((prev) => {
        if (!prev) return prev;
        const isAlreadyDone = prev.completedActivities.includes(activityId);
        const newAnswers = { ...prev.answers, [activityId]: answer };
        const newXp = isAlreadyDone ? prev.xp : Math.min(prev.xp + xp, TOTAL_XP);
        const newCompleted = isAlreadyDone
          ? prev.completedActivities
          : [...prev.completedActivities, activityId];
        const next: QuestSession = {
          ...prev,
          answers: newAnswers,
          xp: newXp,
          completedActivities: newCompleted,
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const goToStep = useCallback(
    (step: 1 | 2 | 3 | 4) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next: QuestSession = { ...prev, currentStep: step };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const markCompleted = useCallback(async () => {
    if (!session) return;
    try {
      await fetch(`/api/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      setSession((prev) =>
        prev ? { ...prev, completedAt: new Date().toISOString() } : prev,
      );
    } catch {
      // ignore
    }
  }, [session]);

  const value = useMemo<QuestContextValue>(
    () => ({
      session,
      loading,
      error,
      startSession,
      resumeSession,
      resetSession,
      completeActivity,
      goToStep,
      markCompleted,
      totalXp: TOTAL_XP,
      totalActivities: TOTAL_ACTIVITIES,
      progressPct: session
        ? Math.round((session.completedActivities.length / TOTAL_ACTIVITIES) * 100)
        : 0,
    }),
    [
      session,
      loading,
      error,
      startSession,
      resumeSession,
      resetSession,
      completeActivity,
      goToStep,
      markCompleted,
    ],
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}

export function useQuest() {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error("useQuest must be used within QuestProvider");
  return ctx;
}

function deriveCompleted(answers: Record<string, unknown>): string[] {
  return Object.keys(answers).filter((k) => !!findActivity(k));
}

function clampStep(n: number): 1 | 2 | 3 | 4 {
  if (n <= 1) return 1;
  if (n >= 4) return 4;
  return n as 1 | 2 | 3 | 4;
}

async function safeError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return j?.error || "שגיאה לא צפויה.";
  } catch {
    return "שגיאה לא צפויה.";
  }
}

export function getStageActivities(step: 1 | 2 | 3 | 4) {
  return STAGES.find((s) => s.number === step)!.activities;
}
