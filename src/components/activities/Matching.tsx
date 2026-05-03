"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import type { MatchingActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

interface Props {
  activity: MatchingActivity;
  onComplete: () => void;
}

export function MatchingUI({ activity, onComplete }: Props) {
  const { completeActivity, session } = useQuest();
  const previous = session?.answers[activity.id] as { matches?: Record<string, string>; correctCount?: number } | undefined;

  // Shuffle right side once (deterministic per activity id)
  const rightOrder = useMemo(() => {
    const arr = activity.pairs.map((p) => p.id);
    return shuffleSeeded(arr, activity.id);
  }, [activity.id, activity.pairs]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>(previous?.matches ?? {});
  const [revealed, setRevealed] = useState<boolean>(!!previous);

  const usedRights = new Set(Object.values(matches));

  function pickLeft(id: string) {
    if (revealed) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  }
  function pickRight(rid: string) {
    if (revealed) return;
    if (!selectedLeft) return;
    setMatches((prev) => {
      // remove the right from any existing match
      const cleaned: Record<string, string> = {};
      for (const [l, r] of Object.entries(prev)) if (r !== rid && l !== selectedLeft) cleaned[l] = r;
      cleaned[selectedLeft] = rid;
      return cleaned;
    });
    setSelectedLeft(null);
  }
  function unmatch(lid: string) {
    if (revealed) return;
    setMatches((prev) => {
      const next = { ...prev };
      delete next[lid];
      return next;
    });
  }

  function check() {
    let correctCount = 0;
    for (const p of activity.pairs) {
      if (matches[p.id] === p.id) correctCount++;
    }
    setRevealed(true);
    completeActivity(activity.id, { matches, correctCount, total: activity.pairs.length }, activity.xp);
  }

  const allMatched = Object.keys(matches).length === activity.pairs.length;

  return (
    <div>
      <p className="text-lg font-semibold mb-5 leading-relaxed">{activity.question}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          {activity.pairs.map((p) => {
            const matched = matches[p.id];
            const isSelected = selectedLeft === p.id;
            const isCorrect = revealed && matched === p.id;
            const isWrong = revealed && matched && matched !== p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => (matched ? unmatch(p.id) : pickLeft(p.id))}
                className={
                  "w-full text-right rounded-xl border px-3 py-3 text-sm sm:text-base font-medium transition-all flex items-center justify-between gap-2 " +
                  (isCorrect
                    ? "border-emerald-300/70 bg-emerald-300/15"
                    : isWrong
                      ? "border-rose-300/70 bg-rose-400/10"
                      : matched
                        ? "border-emerald-300/40 bg-emerald-300/5"
                        : isSelected
                          ? "border-emerald-300/70 bg-emerald-300/10 shadow-[0_0_30px_-10px_rgba(16,255,168,0.5)]"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]")
                }
              >
                <span>{p.left}</span>
                {matched && (
                  <span className="text-[10px] text-white/50">
                    ↔ {activity.pairs.find((q) => q.id === matched)?.right}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {rightOrder.map((rid) => {
            const pair = activity.pairs.find((p) => p.id === rid)!;
            const isUsed = usedRights.has(rid);
            const matchedLeft = Object.keys(matches).find((l) => matches[l] === rid);
            const isCorrect = revealed && matchedLeft === rid;
            const isWrong = revealed && matchedLeft && matchedLeft !== rid;
            return (
              <button
                key={rid}
                type="button"
                disabled={!selectedLeft && !isUsed}
                onClick={() => pickRight(rid)}
                className={
                  "w-full text-right rounded-xl border px-3 py-3 text-sm sm:text-base font-medium transition-all " +
                  (isCorrect
                    ? "border-emerald-300/70 bg-emerald-300/15"
                    : isWrong
                      ? "border-rose-300/70 bg-rose-400/10"
                      : isUsed
                        ? "border-emerald-300/30 bg-emerald-300/[0.04]"
                        : selectedLeft
                          ? "border-white/30 bg-white/[0.06] hover:bg-emerald-300/10 hover:border-emerald-300/40"
                          : "border-white/10 bg-white/[0.03] opacity-90")
                }
              >
                {pair.right}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-white/45 mt-3">
        בחרו פריט בצד ימין → לחצו על ההתאמה משמאל. לחיצה על פריט שכבר הותאם תבטל את ההתאמה.
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white/85"
          >
            דייקתם {Object.keys(matches).filter((k) => matches[k] === k).length} מתוך{" "}
            {activity.pairs.length}.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-end gap-3">
        {!revealed ? (
          <button type="button" onClick={check} disabled={!allMatched} className="btn-primary">
            בדקו ←
          </button>
        ) : (
          <button type="button" onClick={onComplete} className="btn-primary">
            המשך ←
          </button>
        )}
      </div>
    </div>
  );
}

function shuffleSeeded<T>(arr: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
