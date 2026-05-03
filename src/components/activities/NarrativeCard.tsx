"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { useState } from "react";
import type { NarrativeCardActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

const accentToClass: Record<NarrativeCardActivity["accent"], { bg: string; glow: string; chip: string }> = {
  emerald: {
    bg: "from-emerald-500/30 via-emerald-400/10 to-cyan-500/20",
    glow: "shadow-[0_0_80px_-10px_rgba(16,255,168,0.6)]",
    chip: "bg-emerald-400/20 border-emerald-300/40 text-emerald-100",
  },
  amber: {
    bg: "from-amber-500/30 via-orange-400/10 to-rose-500/20",
    glow: "shadow-[0_0_80px_-10px_rgba(251,191,36,0.6)]",
    chip: "bg-amber-400/20 border-amber-300/40 text-amber-100",
  },
  violet: {
    bg: "from-violet-500/30 via-fuchsia-400/10 to-indigo-500/20",
    glow: "shadow-[0_0_80px_-10px_rgba(167,139,250,0.65)]",
    chip: "bg-violet-400/20 border-violet-300/40 text-violet-100",
  },
};

interface Props {
  activity: NarrativeCardActivity;
  onSwiped: () => void;
  onPrev?: () => void;
  isLast?: boolean;
}

export function NarrativeCard({ activity, onSwiped, onPrev, isLast }: Props) {
  const { completeActivity, session } = useQuest();
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  const accent = accentToClass[activity.accent];
  const done = !!session?.completedActivities.includes(activity.id);

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.x < -120 || info.velocity.x < -500) {
      // swipe left → next (because RTL: visually left = forward)
      setExiting("left");
      setTimeout(() => {
        completeActivity(activity.id, { swiped: "next" }, activity.xp);
        onSwiped();
      }, 250);
    } else if (info.offset.x > 120 || info.velocity.x > 500) {
      // swipe right → prev
      if (onPrev) {
        setExiting("right");
        setTimeout(() => onPrev(), 250);
      }
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      animate={
        exiting === "left"
          ? { x: -600, opacity: 0, rotate: -20 }
          : exiting === "right"
            ? { x: 600, opacity: 0, rotate: 20 }
            : undefined
      }
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className={`relative cursor-grab active:cursor-grabbing select-none rounded-3xl overflow-hidden ${accent.glow}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent.bg} opacity-90`} />
      <div className="absolute inset-0 backdrop-blur-2xl" style={{ background: "rgba(8,7,18,0.55)" }} />

      <div className="relative p-8 sm:p-12 min-h-[460px] flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="text-6xl sm:text-7xl drop-shadow-lg">{activity.emoji}</div>
          <span className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${accent.chip}`}>
            {activity.badge}
          </span>
        </div>

        <h2 className="mt-8 text-4xl sm:text-5xl font-display font-black leading-tight">
          {activity.headline}
        </h2>
        <p className="mt-3 text-lg sm:text-xl text-white/85">{activity.tagline}</p>

        <p className="mt-6 text-base sm:text-lg leading-relaxed text-white/80 flex-1">
          {activity.body}
        </p>

        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="text-xs text-white/55 flex items-center gap-2">
            <span aria-hidden>👆</span>
            החליקו {isLast ? "כדי לסיים" : "להמשך"} — או לחצו
          </div>
          <button
            type="button"
            onClick={() => {
              setExiting("left");
              setTimeout(() => {
                completeActivity(activity.id, { swiped: "next" }, activity.xp);
                onSwiped();
              }, 250);
            }}
            className="btn-primary"
            aria-label={isLast ? "סיים שלב" : "כרטיס הבא"}
          >
            {done ? "המשך" : isLast ? "סיים שלב" : "הבא"} ←
          </button>
        </div>
      </div>
    </motion.div>
  );
}
