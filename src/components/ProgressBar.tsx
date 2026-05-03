"use client";

import { motion } from "framer-motion";
import { useQuest } from "@/lib/quest-context";
import { STAGES } from "@/lib/questData";

export function ProgressBar() {
  const { session, totalXp, totalActivities, progressPct } = useQuest();
  if (!session) return null;

  const xp = session.xp;
  const xpPct = (xp / totalXp) * 100;
  const completed = session.completedActivities.length;

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="glass-strong rounded-2xl px-4 sm:px-6 py-3 flex items-center gap-4">
          <div className="hidden sm:flex flex-col">
            <span className="text-[11px] uppercase tracking-widest text-white/50 font-display">
              Shacharit Quest
            </span>
            <span className="text-sm font-semibold text-white/90">{session.studentName}</span>
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span>
                שלב {session.currentStep}/4 · {completed}/{totalActivities} משימות
              </span>
              <span className="text-white/80 font-semibold">{progressPct}%</span>
            </div>
            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 18 }}
                className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-emerald-300 via-emerald-400 to-cyan-400"
                style={{ boxShadow: "0 0 14px rgba(16,255,168,0.55)" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <StepDots
              current={session.currentStep}
              highest={
                Math.max(
                  session.currentStep,
                  deriveHighestStage(session.completedActivities),
                ) as 1 | 2 | 3 | 4
              }
            />
            <XPBadge xp={xp} totalXp={totalXp} xpPct={xpPct} />
          </div>
        </div>
      </div>
    </header>
  );
}

function deriveHighestStage(completed: string[]): 1 | 2 | 3 | 4 {
  let highest: 1 | 2 | 3 | 4 = 1;
  for (const id of completed) {
    for (const s of STAGES) {
      if (s.activities.some((a) => a.id === id) && s.number > highest) {
        highest = s.number;
      }
    }
  }
  return highest;
}

function StepDots({ current, highest }: { current: 1 | 2 | 3 | 4; highest: 1 | 2 | 3 | 4 }) {
  const reached = Math.max(current, highest);
  return (
    <div className="hidden md:flex items-center gap-1.5">
      {[1, 2, 3, 4].map((n) => {
        const active = n === current;
        const done = n < reached;
        return (
          <span
            key={n}
            className={
              "relative h-2.5 w-2.5 rounded-full transition-colors " +
              (active
                ? "bg-emerald-300 shadow-[0_0_12px_rgba(16,255,168,0.8)]"
                : done
                  ? "bg-emerald-500/70"
                  : "bg-white/15")
            }
            aria-label={`שלב ${n}`}
          />
        );
      })}
    </div>
  );
}

function XPBadge({ xp, totalXp, xpPct }: { xp: number; totalXp: number; xpPct: number }) {
  return (
    <motion.div
      key={xp}
      initial={{ scale: 0.96 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 14 }}
      className="relative flex items-center gap-2 rounded-full border border-amber-300/30 bg-gradient-to-l from-amber-400/20 via-amber-300/10 to-amber-200/5 px-3 py-1.5"
      style={{ boxShadow: `0 0 ${20 + xpPct * 0.4}px -4px rgba(251,191,36,${0.25 + xpPct * 0.005})` }}
    >
      <span className="text-amber-300 text-base">⚡</span>
      <span className="font-display font-bold text-amber-100 tabular-nums">
        {xp}
        <span className="text-amber-200/50 text-xs font-medium"> / {totalXp}</span>
      </span>
    </motion.div>
  );
}
