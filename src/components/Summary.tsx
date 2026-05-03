"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useQuest } from "@/lib/quest-context";
import { STAGES, findActivity } from "@/lib/questData";

export function Summary() {
  const { session, totalXp, markCompleted, resetSession } = useQuest();

  useEffect(() => {
    if (session && !session.completedAt) {
      markCompleted();
    }
  }, [session, markCompleted]);

  if (!session) return null;

  const xpPct = Math.round((session.xp / totalXp) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="text-center"
      >
        <div className="text-7xl">🏆</div>
        <div className="mt-4 text-[11px] tracking-[0.4em] uppercase text-emerald-300 font-display">
          Quest Complete
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-display font-black leading-tight">
          החוקר{" "}
          <span className="bg-gradient-to-l from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            {session.studentName}
          </span>{" "}
          מוכן למסע בשחרית
        </h1>
        <p className="mt-4 text-white/70 max-w-xl mx-auto leading-relaxed">
          טיפ אחרון: בחירת מגמה היא בחירה אישית — לא לפי חברים. זה יחזיק אתכם בעמידה
          הארוכה של מגמות החוץ.
        </p>
      </motion.div>

      {/* XP gauge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 glass-strong rounded-3xl p-8 text-center glow-emerald"
      >
        <div className="text-xs uppercase tracking-widest text-amber-200 font-display">
          XP שצברתם
        </div>
        <div className="mt-2 text-7xl font-display font-black tabular-nums bg-gradient-to-l from-amber-200 to-yellow-300 bg-clip-text text-transparent">
          {session.xp.toLocaleString("he-IL")}
        </div>
        <div className="text-white/55 mt-1">
          מתוך {totalXp.toLocaleString("he-IL")} ({xpPct}%)
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-l from-emerald-300 via-amber-300 to-violet-300"
          />
        </div>
      </motion.div>

      {/* Stage breakdown */}
      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {STAGES.map((s) => {
          const stageXp = s.activities.reduce((sum, a) => {
            return sum + (session.completedActivities.includes(a.id) ? a.xp : 0);
          }, 0);
          const stageMax = s.activities.reduce((sum, a) => sum + a.xp, 0);
          return (
            <div key={s.number} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{s.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold">{s.title}</div>
                  <div className="text-xs text-white/50">
                    {s.activities.filter((a) => session.completedActivities.includes(a.id)).length} /{" "}
                    {s.activities.length} משימות
                  </div>
                </div>
                <div className="text-amber-300 font-bold tabular-nums">
                  {stageXp}
                  <span className="text-amber-200/40 text-xs">/{stageMax}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Open answers reflection */}
      {hasOpenAnswers(session.answers) && (
        <div className="mt-8 glass rounded-3xl p-6">
          <div className="text-xs uppercase tracking-widest text-white/45 font-display mb-3">
            מה כתבתם
          </div>
          <div className="space-y-4">
            {Object.entries(session.answers).map(([aid, answer]) => {
              const a = findActivity(aid);
              if (!a) return null;
              if (a.kind !== "open-text" && a.kind !== "external-entry") return null;
              return (
                <div key={aid} className="border-r-2 border-emerald-300/30 pr-3">
                  <div className="text-sm font-semibold text-emerald-200">{a.title}</div>
                  <div className="text-sm text-white/70 mt-1">
                    {Object.entries(answer as Record<string, string>).map(([k, v]) => (
                      <div key={k} className="text-white/65 leading-relaxed">
                        <span className="text-white/40 text-xs">
                          {a.fields.find((f) => f.id === k)?.label || k}:{" "}
                        </span>
                        {String(v)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => {
            if (confirm("להתחיל קוויסט חדש? ההתקדמות הקיימת תימחק מהמכשיר הזה.")) {
              resetSession();
            }
          }}
          className="btn-ghost"
        >
          התחילו קוויסט חדש
        </button>
        <div className="mt-2 text-xs text-white/40">
          התשובות שלכם נשמרו בענן ויהיו זמינות למחנכים שלכם.
        </div>
      </div>
    </div>
  );
}

function hasOpenAnswers(answers: Record<string, unknown>): boolean {
  return Object.keys(answers).some((k) => {
    const a = findActivity(k);
    return a && (a.kind === "open-text" || a.kind === "external-entry");
  });
}
