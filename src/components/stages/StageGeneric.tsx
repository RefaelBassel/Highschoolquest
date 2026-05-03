"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useQuest } from "@/lib/quest-context";
import { STAGES, type Activity } from "@/lib/questData";
import { StageHeader } from "../StageHeader";
import { ActivityRenderer } from "../activities";

const accentToText: Record<string, string> = {
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  violet: "text-violet-300",
  amber: "text-amber-300",
};

export function StageGeneric({
  stageNumber,
  onStageComplete,
}: {
  stageNumber: 2 | 3 | 4;
  onStageComplete: () => void;
}) {
  const stage = STAGES.find((s) => s.number === stageNumber)!;
  const { session } = useQuest();
  const activities = stage.activities as Activity[];

  const completed = session?.completedActivities ?? [];
  const initialIdx = (() => {
    const i = activities.findIndex((a) => !completed.includes(a.id));
    return i === -1 ? activities.length - 1 : i;
  })();
  const [idx, setIdx] = useState(initialIdx);
  const [showSummary, setShowSummary] = useState(
    activities.every((a) => completed.includes(a.id)),
  );
  const scrollAnchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [idx, showSummary]);

  function handleComplete() {
    if (idx < activities.length - 1) {
      setIdx(idx + 1);
    } else {
      setShowSummary(true);
    }
  }

  const accentClass = accentToText[stage.accent] ?? "text-emerald-300";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12" ref={scrollAnchor}>
      <StageHeader
        number={stage.number}
        emoji={stage.emoji}
        title={stage.title}
        subtitle={stage.subtitle}
        description={stage.description}
        accent={stage.accent}
      />

      {!showSummary ? (
        <>
          {/* Activity nav (mini) */}
          <div className="flex items-center justify-center gap-1.5 mb-5 flex-wrap">
            {activities.map((a, i) => {
              const isDone = completed.includes(a.id);
              const isCurrent = i === idx;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={
                    "h-7 px-2 rounded-full border text-[11px] font-bold transition-all " +
                    (isCurrent
                      ? "border-emerald-300/60 bg-emerald-300/15 text-emerald-100"
                      : isDone
                        ? "border-emerald-300/30 bg-emerald-300/[0.06] text-emerald-200/80"
                        : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.06]")
                  }
                  aria-label={`משימה ${i + 1}`}
                >
                  {isDone ? "✓" : i + 1}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activities[idx].id}>
              <ActivityRenderer
                activity={activities[idx]}
                index={idx}
                total={activities.length}
                accentClass={accentClass}
                onComplete={handleComplete}
              />
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 text-center"
        >
          <div className="text-5xl mb-3">{stage.emoji}✨</div>
          <h3 className="text-2xl font-display font-black">סיימתם את שלב {stage.number}</h3>
          <p className="mt-3 text-white/70 max-w-md mx-auto leading-relaxed">
            {stage.number === 4
              ? "אתם כמעט בקו הסיום. נכנסים למסך הסיכום."
              : `הצטיידתם — בואו נמשיך לשלב ${stage.number + 1}.`}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setShowSummary(false);
                setIdx(0);
              }}
              className="btn-ghost"
            >
              חזרה לסקירה
            </button>
            <button type="button" onClick={onStageComplete} className="btn-primary">
              {stage.number === 4 ? "סיכום הקוויסט" : `המשך לשלב ${stage.number + 1}`} ←
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
