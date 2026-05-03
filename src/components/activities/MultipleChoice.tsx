"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { MultipleChoiceActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

interface Props {
  activity: MultipleChoiceActivity;
  onComplete: () => void;
}

export function MultipleChoiceUI({ activity, onComplete }: Props) {
  const { completeActivity, session } = useQuest();
  const previous = session?.answers[activity.id] as { selectedId?: string; correct?: boolean } | undefined;
  const [selected, setSelected] = useState<string | null>(previous?.selectedId ?? null);
  const [revealed, setRevealed] = useState<boolean>(!!previous);

  function pick(id: string) {
    if (revealed) return;
    setSelected(id);
  }

  function submit() {
    if (!selected) return;
    const correct = selected === activity.correctId;
    setRevealed(true);
    completeActivity(activity.id, { selectedId: selected, correct }, activity.xp);
  }

  return (
    <div>
      <p className="text-lg font-semibold mb-5 leading-relaxed">{activity.question}</p>

      <div className="space-y-3">
        {activity.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = opt.id === activity.correctId;
          const showAsCorrect = revealed && isCorrect;
          const showAsWrong = revealed && isSelected && !isCorrect;

          return (
            <motion.button
              key={opt.id}
              type="button"
              onClick={() => pick(opt.id)}
              whileHover={!revealed ? { scale: 1.01 } : undefined}
              whileTap={!revealed ? { scale: 0.99 } : undefined}
              className={
                "w-full text-right rounded-xl border px-4 py-3.5 transition-all flex items-center justify-between gap-3 " +
                (showAsCorrect
                  ? "border-emerald-300/70 bg-emerald-300/15 text-emerald-50"
                  : showAsWrong
                    ? "border-rose-300/70 bg-rose-400/10 text-rose-100"
                    : isSelected
                      ? "border-emerald-300/70 bg-emerald-300/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20")
              }
            >
              <span className="text-base sm:text-lg">{opt.label}</span>
              <span className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-xs font-bold border border-white/20">
                {showAsCorrect ? "✓" : showAsWrong ? "✗" : isSelected ? "•" : ""}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="text-sm text-white/55 mb-1 font-display tracking-wider uppercase">
              {selected === activity.correctId ? "✓ נכון" : "כיוון לחשוב"}
            </div>
            <div className="text-white/85 leading-relaxed">{activity.explanation}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-end gap-3">
        {!revealed ? (
          <button
            type="button"
            onClick={submit}
            disabled={!selected}
            className="btn-primary disabled:opacity-40"
          >
            בדקו →
          </button>
        ) : (
          <button type="button" onClick={onComplete} className="btn-primary">
            המשך →
          </button>
        )}
      </div>
    </div>
  );
}
