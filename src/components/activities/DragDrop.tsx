"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { DragDropActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

interface Props {
  activity: DragDropActivity;
  onComplete: () => void;
}

interface ItemState {
  id: string;
  label: string;
  correct: boolean;
  in: "pool" | "target";
}

export function DragDropUI({ activity, onComplete }: Props) {
  const { completeActivity, session } = useQuest();
  const previous = session?.answers[activity.id] as { droppedIds?: string[]; correct?: boolean } | undefined;

  const [items, setItems] = useState<ItemState[]>(() =>
    activity.items.map((i) => ({
      id: i.id,
      label: i.label,
      correct: i.correct,
      in: previous?.droppedIds?.includes(i.id) ? "target" : "pool",
    })),
  );
  const [revealed, setRevealed] = useState<boolean>(!!previous);
  // SSR fix for @hello-pangea/dnd
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function onDragEnd(res: DropResult) {
    if (revealed) return;
    if (!res.destination) return;
    const fromTarget = res.source.droppableId === "target";
    const toTarget = res.destination.droppableId === "target";
    if (fromTarget === toTarget) return;
    setItems((prev) =>
      prev.map((it) => (it.id === res.draggableId ? { ...it, in: toTarget ? "target" : "pool" } : it)),
    );
  }

  function check() {
    const droppedIds = items.filter((i) => i.in === "target").map((i) => i.id);
    const allCorrectIn = activity.items.filter((i) => i.correct).every((i) => droppedIds.includes(i.id));
    const noWrongIn = droppedIds.every((id) => activity.items.find((i) => i.id === id)?.correct);
    const correct = allCorrectIn && noWrongIn;
    setRevealed(true);
    completeActivity(activity.id, { droppedIds, correct }, activity.xp);
  }

  const pool = items.filter((i) => i.in === "pool");
  const dropped = items.filter((i) => i.in === "target");

  if (!mounted) {
    return <div className="h-64 grid place-items-center text-white/40 text-sm">טוען…</div>;
  }

  return (
    <div>
      <p className="text-lg font-semibold mb-5 leading-relaxed">{activity.question}</p>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Pool */}
          <Droppable droppableId="pool" direction="horizontal">
            {(prov) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 min-h-[180px]"
              >
                <div className="text-xs font-display uppercase tracking-wider text-white/50 mb-3">
                  המקצועות
                </div>
                <div className="flex flex-wrap gap-2">
                  {pool.map((it, idx) => (
                    <Draggable key={it.id} draggableId={it.id} index={idx} isDragDisabled={revealed}>
                      {(p, snap) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          {...p.dragHandleProps}
                          className={
                            "rounded-xl border px-3.5 py-2 font-semibold text-sm cursor-grab active:cursor-grabbing select-none transition-shadow " +
                            (snap.isDragging
                              ? "bg-emerald-300/20 border-emerald-300/60 shadow-[0_0_30px_-6px_rgba(16,255,168,0.6)]"
                              : "bg-white/5 border-white/15 hover:bg-white/10")
                          }
                          style={p.draggableProps.style}
                        >
                          {it.label}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {prov.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          {/* Target */}
          <Droppable droppableId="target" direction="horizontal">
            {(prov, snap) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className={
                  "rounded-2xl border-2 p-4 min-h-[180px] transition-colors " +
                  (snap.isDraggingOver
                    ? "border-emerald-300/70 bg-emerald-300/8"
                    : "border-white/15 bg-gradient-to-br from-emerald-500/8 to-cyan-500/8")
                }
              >
                <div className="text-xs font-display uppercase tracking-wider text-emerald-200 mb-3 flex items-center gap-2">
                  <span className="pulse-dot" />
                  תיבת {activity.targetLabel}
                </div>
                <div className="flex flex-wrap gap-2">
                  {dropped.map((it, idx) => {
                    const showCorrect = revealed && it.correct;
                    const showWrong = revealed && !it.correct;
                    return (
                      <Draggable key={it.id} draggableId={it.id} index={idx} isDragDisabled={revealed}>
                        {(p) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            className={
                              "rounded-xl border px-3.5 py-2 font-semibold text-sm flex items-center gap-2 " +
                              (showCorrect
                                ? "bg-emerald-300/20 border-emerald-300/60"
                                : showWrong
                                  ? "bg-rose-400/15 border-rose-300/50"
                                  : "bg-white/10 border-white/25 cursor-grab active:cursor-grabbing")
                            }
                            style={p.draggableProps.style}
                          >
                            {it.label}
                            {showCorrect && <span className="text-emerald-300 text-xs">✓</span>}
                            {showWrong && <span className="text-rose-300 text-xs">✗</span>}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {prov.placeholder}
                  {dropped.length === 0 && (
                    <span className="text-white/35 text-sm self-center">גררו לכאן…</span>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="text-white/85 leading-relaxed">{activity.explanation}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-end gap-3">
        {!revealed ? (
          <button
            type="button"
            onClick={check}
            disabled={dropped.length === 0}
            className="btn-primary"
          >
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
