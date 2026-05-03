"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { HotspotActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

interface Props {
  activity: HotspotActivity;
  onComplete: () => void;
}

export function HotspotUI({ activity, onComplete }: Props) {
  const { completeActivity, session } = useQuest();
  const previous = session?.answers[activity.id] as { selectedIds?: string[]; correct?: boolean } | undefined;
  const [selected, setSelected] = useState<Set<string>>(() => new Set(previous?.selectedIds ?? []));
  const [revealed, setRevealed] = useState<boolean>(!!previous);

  function toggle(id: string) {
    if (revealed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function check() {
    const selectedIds = [...selected];
    const correctSet = new Set(activity.correctCellIds);
    const allCorrectFound = activity.correctCellIds.every((c) => selectedIds.includes(c));
    const noWrongPicked = selectedIds.every((c) => correctSet.has(c));
    const correct = allCorrectFound && noWrongPicked;
    setRevealed(true);
    completeActivity(activity.id, { selectedIds, correct }, activity.xp);
  }

  const days = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳"];

  return (
    <div>
      <p className="text-lg font-semibold mb-5 leading-relaxed">{activity.question}</p>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4 overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1.5 min-w-[520px]">
          <div className="text-xs text-white/45 text-center py-1">שעה</div>
          {days.map((d) => (
            <div key={d} className="text-xs font-display font-bold text-white/70 text-center py-1">
              יום {d}
            </div>
          ))}

          {activity.grid.map((row, rIdx) => (
            <RowFragment
              key={rIdx}
              row={row}
              labelHint={firstLessonLabel(row)}
              onPick={toggle}
              selected={selected}
              revealed={revealed}
              correctSet={new Set(activity.correctCellIds)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white/85 leading-relaxed"
          >
            {activity.explanation}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-end gap-3">
        {!revealed ? (
          <button type="button" onClick={check} disabled={selected.size === 0} className="btn-primary">
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

function firstLessonLabel(row: { label: string; type: string }[]) {
  // grab the time from any cell label like "יום א׳ · 8:00"
  for (const c of row) {
    const m = c.label.match(/·\s*(\S+)/);
    if (m) return m[1];
    if (c.label === "הפסקה" || c.label === 'בית מדרש') return c.label;
  }
  return "";
}

interface RowProps {
  row: { id: string; label: string; type: string }[];
  labelHint: string;
  onPick: (id: string) => void;
  selected: Set<string>;
  revealed: boolean;
  correctSet: Set<string>;
}

function RowFragment({ row, labelHint, onPick, selected, revealed, correctSet }: RowProps) {
  return (
    <>
      <div className="text-[11px] text-white/45 grid place-items-center font-mono py-1">
        {labelHint}
      </div>
      {row.map((cell) => {
        const isSel = selected.has(cell.id);
        const isCorrect = correctSet.has(cell.id);
        const correctlyChosen = revealed && isSel && isCorrect;
        const wronglyChosen = revealed && isSel && !isCorrect;
        const missedCorrect = revealed && !isSel && isCorrect;
        const baseType =
          cell.type === "break"
            ? "from-amber-400/15 to-amber-500/5 border-amber-300/20"
            : cell.type === "social"
              ? "from-violet-400/15 to-violet-500/5 border-violet-300/20"
              : "from-white/5 to-white/[0.02] border-white/10";

        return (
          <button
            key={cell.id}
            type="button"
            onClick={() => onPick(cell.id)}
            disabled={revealed}
            className={
              "rounded-lg border bg-gradient-to-br p-2 text-[10px] sm:text-xs font-medium text-center transition-all min-h-[44px] " +
              baseType +
              " " +
              (isSel && !revealed
                ? "ring-2 ring-emerald-300/70 bg-emerald-300/15 border-emerald-300/60"
                : "") +
              (correctlyChosen ? " ring-2 ring-emerald-300/80 bg-emerald-300/20 " : "") +
              (wronglyChosen ? " ring-2 ring-rose-400/70 bg-rose-400/15 " : "") +
              (missedCorrect ? " ring-2 ring-amber-300/60 bg-amber-300/10 " : "")
            }
            aria-pressed={isSel}
          >
            <span className="block text-white/85">
              {cell.type === "break" ? "🌬️ הפסקה" : cell.type === "social" ? "📚 בית מדרש" : "שיעור"}
            </span>
          </button>
        );
      })}
    </>
  );
}
