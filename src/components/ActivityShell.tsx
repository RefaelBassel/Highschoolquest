"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
import { useQuest } from "@/lib/quest-context";

interface Props {
  activityId: string;
  index: number;
  total: number;
  title: string;
  prompt?: string;
  xp: number;
  accentClass?: string;
  children: ReactNode;
}

export function ActivityShell({
  activityId,
  index,
  total,
  title,
  prompt,
  xp,
  accentClass = "text-emerald-300",
  children,
}: Props) {
  const { session } = useQuest();
  const done = !!session?.completedActivities.includes(activityId);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className={`text-[11px] font-display tracking-widest uppercase ${accentClass} opacity-90`}>
            משימה {index + 1} / {total}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mt-1 leading-tight">{title}</h3>
          {prompt && <p className="text-white/70 mt-2 leading-relaxed">{prompt}</p>}
        </div>
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="rounded-full px-3 py-1 text-xs font-bold border border-amber-300/30 bg-amber-300/10 text-amber-200 tabular-nums">
            +{xp} XP
          </div>
          <AnimatePresence>
            {done && (
              <motion.div
                key="done"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-emerald-300 text-xs font-semibold flex items-center gap-1"
              >
                <span>✔</span>
                <span>הושלם</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-2">{children}</div>
    </motion.section>
  );
}
