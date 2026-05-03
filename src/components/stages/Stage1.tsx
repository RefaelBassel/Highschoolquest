"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuest } from "@/lib/quest-context";
import { STAGES, type NarrativeCardActivity } from "@/lib/questData";
import { StageHeader } from "../StageHeader";
import { NarrativeCard } from "../activities/NarrativeCard";

export function Stage1({ onStageComplete }: { onStageComplete: () => void }) {
  const stage = STAGES[0];
  const { session } = useQuest();
  const cards = stage.activities as NarrativeCardActivity[];

  // Resume on first card not yet completed
  const initialIdx = (() => {
    const completed = session?.completedActivities ?? [];
    const firstUnfinished = cards.findIndex((c) => !completed.includes(c.id));
    return firstUnfinished === -1 ? 0 : firstUnfinished;
  })();

  const [idx, setIdx] = useState(initialIdx);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (idx >= cards.length) setDone(true);
  }, [idx, cards.length]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <StageHeader
        number={stage.number}
        emoji={stage.emoji}
        title={stage.title}
        subtitle={stage.subtitle}
        description={stage.description}
        accent={stage.accent}
      />

      {!done ? (
        <>
          <div className="relative h-[520px]">
            <AnimatePresence mode="wait">
              <NarrativeCard
                key={cards[idx].id}
                activity={cards[idx]}
                isLast={idx === cards.length - 1}
                onSwiped={() => setIdx((i) => i + 1)}
                onPrev={idx > 0 ? () => setIdx((i) => i - 1) : undefined}
              />
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {cards.map((c, i) => (
              <span
                key={c.id}
                className={
                  "h-1.5 w-8 rounded-full transition-colors " +
                  (i === idx
                    ? "bg-emerald-300 shadow-[0_0_8px_rgba(16,255,168,0.7)]"
                    : i < idx
                      ? "bg-emerald-500/50"
                      : "bg-white/10")
                }
              />
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 text-center"
        >
          <div className="text-5xl mb-3">📖✨</div>
          <h3 className="text-2xl font-display font-black">השתתפתם בסיפור הגדול</h3>
          <p className="mt-3 text-white/70 leading-relaxed max-w-md mx-auto">
            עכשיו שיש לכם תמונה — נצלול לפרקטיקה. שלב הבא: מעבדת הלו״ז והערכים.
          </p>
          <button type="button" onClick={onStageComplete} className="btn-primary mt-6">
            המשך לשלב 2 ←
          </button>
        </motion.div>
      )}
    </div>
  );
}
