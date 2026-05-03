"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { FlipCardActivity, FlipCardDeckActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

interface FlipCardProps {
  activity: FlipCardActivity;
  onComplete: () => void;
}

export function FlipCardUI({ activity, onComplete }: FlipCardProps) {
  const { completeActivity, session } = useQuest();
  const wasCompleted = !!session?.completedActivities.includes(activity.id);
  const [flipped, setFlipped] = useState<boolean>(wasCompleted);

  function handleFlip() {
    if (!flipped) {
      setFlipped(true);
      completeActivity(activity.id, { read: true }, activity.xp);
    } else {
      setFlipped(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-white/60 mb-4">לחצו על הקלף כדי לקבל את הטיפ.</p>

      <div className="[perspective:1400px] mx-auto max-w-md">
        <motion.button
          type="button"
          onClick={handleFlip}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-[3/4] rounded-3xl [transform-style:preserve-3d] cursor-pointer"
        >
          <Face front emoji={activity.emoji} text={activity.front} />
          <Face emoji={activity.emoji} text={activity.back} />
        </motion.button>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" onClick={handleFlip} className="btn-ghost">
          {flipped ? "הפוך חזרה" : "גלו את הטיפ"}
        </button>
        {flipped && (
          <button type="button" onClick={onComplete} className="btn-primary">
            המשך ←
          </button>
        )}
      </div>
    </div>
  );
}

function Face({ front = false, emoji, text }: { front?: boolean; emoji: string; text: string }) {
  return (
    <div
      className={
        "absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden] " +
        (front ? "" : "[transform:rotateY(180deg)] ")
      }
      style={{
        background: front
          ? "linear-gradient(135deg, rgba(167,139,250,0.30), rgba(56,189,248,0.20))"
          : "linear-gradient(135deg, rgba(16,255,168,0.20), rgba(56,189,248,0.15))",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="text-6xl mb-4 drop-shadow">{emoji}</div>
      <div className={"font-display " + (front ? "text-3xl font-black" : "text-base leading-relaxed")}>
        {text}
      </div>
      {front && (
        <div className="absolute bottom-4 right-4 text-xs text-white/50 flex items-center gap-1">
          <span>הקליקו להפוך</span> <span aria-hidden>↻</span>
        </div>
      )}
    </div>
  );
}

// ============== Deck of flip cards ==============

interface DeckProps {
  activity: FlipCardDeckActivity;
  onComplete: () => void;
}

export function FlipCardDeck({ activity, onComplete }: DeckProps) {
  const { completeActivity, session } = useQuest();
  const wasCompleted = !!session?.completedActivities.includes(activity.id);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(
    () => new Set(wasCompleted ? activity.cards.map((c) => c.id) : []),
  );

  function toggle(id: string) {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // when ALL flipped, auto-complete
      if (next.size === activity.cards.length && !wasCompleted) {
        completeActivity(activity.id, { flippedAll: true }, activity.xp);
      }
      return next;
    });
  }

  const allFlipped = flippedIds.size === activity.cards.length;

  return (
    <div>
      {activity.prompt && <p className="text-base text-white/70 mb-5">{activity.prompt}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {activity.cards.map((c) => {
          const isFlipped = flippedIds.has(c.id);
          return (
            <div key={c.id} className="[perspective:1400px]">
              <motion.button
                type="button"
                onClick={() => toggle(c.id)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full aspect-[4/5] rounded-2xl [transform-style:preserve-3d] cursor-pointer"
              >
                <DeckFace front emoji={c.emoji} title={c.front} />
                <DeckFace title={c.back} small />
              </motion.button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {allFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 rounded-xl border border-emerald-300/30 bg-emerald-300/8 p-4 text-emerald-100"
          >
            ✓ פתחתם את כל המושגים. עכשיו השפה הזאת שלכם.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-xs text-white/50">
          {flippedIds.size} / {activity.cards.length} נחשפו
        </div>
        <button
          type="button"
          onClick={onComplete}
          disabled={!allFlipped}
          className="btn-primary disabled:opacity-40"
        >
          המשך ←
        </button>
      </div>
    </div>
  );
}

function DeckFace({ front = false, emoji, title, small }: { front?: boolean; emoji?: string; title: string; small?: boolean }) {
  return (
    <div
      className={
        "absolute inset-0 rounded-2xl p-4 flex flex-col items-center justify-center text-center [backface-visibility:hidden] " +
        (front ? "" : "[transform:rotateY(180deg)] ")
      }
      style={{
        background: front
          ? "linear-gradient(135deg, rgba(167,139,250,0.35), rgba(56,189,248,0.20))"
          : "linear-gradient(135deg, rgba(16,255,168,0.18), rgba(56,189,248,0.10))",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.55)",
      }}
    >
      {emoji && <div className="text-4xl mb-2 drop-shadow">{emoji}</div>}
      <div
        className={
          "font-display leading-snug " +
          (front ? "text-xl font-black" : small ? "text-[12px] leading-relaxed font-medium" : "text-sm")
        }
      >
        {title}
      </div>
    </div>
  );
}
