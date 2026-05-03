"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { SortCategoriesActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

const colorMap: Record<string, { ring: string; bg: string; text: string; chip: string }> = {
  emerald: {
    ring: "border-emerald-300/40",
    bg: "from-emerald-500/10 to-emerald-500/5",
    text: "text-emerald-200",
    chip: "bg-emerald-300/15 border-emerald-300/40",
  },
  sky: {
    ring: "border-sky-300/40",
    bg: "from-sky-500/10 to-sky-500/5",
    text: "text-sky-200",
    chip: "bg-sky-300/15 border-sky-300/40",
  },
  violet: {
    ring: "border-violet-300/40",
    bg: "from-violet-500/10 to-violet-500/5",
    text: "text-violet-200",
    chip: "bg-violet-300/15 border-violet-300/40",
  },
  amber: {
    ring: "border-amber-300/40",
    bg: "from-amber-500/10 to-amber-500/5",
    text: "text-amber-200",
    chip: "bg-amber-300/15 border-amber-300/40",
  },
};

interface Props {
  activity: SortCategoriesActivity;
  onComplete: () => void;
}

interface ItemState {
  id: string;
  label: string;
  correctCategoryId: string;
  in: string; // 'pool' | category id
}

export function SortCategoriesUI({ activity, onComplete }: Props) {
  const { completeActivity, session } = useQuest();
  const previous = session?.answers[activity.id] as
    | { placements?: Record<string, string>; correctCount?: number }
    | undefined;

  const [items, setItems] = useState<ItemState[]>(() =>
    activity.items.map((i) => ({
      id: i.id,
      label: i.label,
      correctCategoryId: i.categoryId,
      in: previous?.placements?.[i.id] ?? "pool",
    })),
  );
  const [revealed, setRevealed] = useState<boolean>(!!previous);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function onDragEnd(res: DropResult) {
    if (revealed) return;
    if (!res.destination) return;
    setItems((prev) =>
      prev.map((it) => (it.id === res.draggableId ? { ...it, in: res.destination!.droppableId } : it)),
    );
  }

  function check() {
    let correctCount = 0;
    const placements: Record<string, string> = {};
    items.forEach((it) => {
      placements[it.id] = it.in;
      if (it.in === it.correctCategoryId) correctCount++;
    });
    setRevealed(true);
    completeActivity(activity.id, { placements, correctCount, total: items.length }, activity.xp);
  }

  const allPlaced = items.every((i) => i.in !== "pool");

  if (!mounted) {
    return <div className="h-72 grid place-items-center text-white/40 text-sm">טוען…</div>;
  }

  return (
    <div>
      <p className="text-lg font-semibold mb-5 leading-relaxed">{activity.question}</p>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Pool */}
        <Droppable droppableId="pool" direction="horizontal">
          {(prov) => (
            <div
              ref={prov.innerRef}
              {...prov.droppableProps}
              className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 mb-4"
            >
              <div className="text-xs font-display uppercase tracking-wider text-white/50 mb-2">
                גררו לקטגוריות בהמשך
              </div>
              <div className="flex flex-wrap gap-2 min-h-[42px]">
                {items
                  .filter((i) => i.in === "pool")
                  .map((it, idx) => (
                    <Draggable key={it.id} draggableId={it.id} index={idx} isDragDisabled={revealed}>
                      {(p, snap) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          {...p.dragHandleProps}
                          className={
                            "rounded-xl border px-3.5 py-2 font-semibold text-sm cursor-grab active:cursor-grabbing select-none " +
                            (snap.isDragging
                              ? "bg-emerald-300/20 border-emerald-300/60"
                              : "bg-white/5 border-white/15")
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

        {/* Categories */}
        <div className="grid md:grid-cols-3 gap-3">
          {activity.categories.map((cat) => {
            const c = colorMap[cat.color] || colorMap.emerald;
            return (
              <Droppable key={cat.id} droppableId={cat.id} direction="horizontal">
                {(prov, snap) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.droppableProps}
                    className={
                      "rounded-2xl border-2 p-4 min-h-[180px] bg-gradient-to-br " +
                      c.bg +
                      " " +
                      (snap.isDraggingOver ? "border-white/40" : c.ring)
                    }
                  >
                    <div className={"text-sm font-bold mb-1 " + c.text}>{cat.label}</div>
                    {cat.description && (
                      <div className="text-[11px] text-white/45 mb-3">{cat.description}</div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {items
                        .filter((i) => i.in === cat.id)
                        .map((it, idx) => {
                          const isCorrect = revealed && it.correctCategoryId === cat.id;
                          const isWrong = revealed && it.correctCategoryId !== cat.id;
                          return (
                            <Draggable
                              key={it.id}
                              draggableId={it.id}
                              index={idx}
                              isDragDisabled={revealed}
                            >
                              {(p) => (
                                <div
                                  ref={p.innerRef}
                                  {...p.draggableProps}
                                  {...p.dragHandleProps}
                                  className={
                                    "rounded-xl border px-3 py-1.5 text-sm font-semibold flex items-center gap-2 " +
                                    (isCorrect
                                      ? "bg-emerald-300/20 border-emerald-300/60"
                                      : isWrong
                                        ? "bg-rose-400/15 border-rose-300/50"
                                        : "bg-white/10 border-white/25 cursor-grab active:cursor-grabbing")
                                  }
                                  style={p.draggableProps.style}
                                >
                                  {it.label}
                                  {isCorrect && <span className="text-emerald-300 text-xs">✓</span>}
                                  {isWrong && <span className="text-rose-300 text-xs">✗</span>}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {prov.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white/85 leading-relaxed"
          >
            דייקתם {items.filter((i) => i.in === i.correctCategoryId).length} מתוך {items.length}.
            הצבע הירוק = נכון, האדום = להעביר. גם טעות מקדמת — היא מראה איפה כדאי להעמיק.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-end gap-3">
        {!revealed ? (
          <button type="button" onClick={check} disabled={!allPlaced} className="btn-primary">
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
