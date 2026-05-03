"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface Props {
  show: boolean;
  stageNumber: number;
  stageTitle: string;
  onClose: () => void;
}

export function LevelUp({ show, stageNumber, stageTitle, onClose }: Props) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Burst rays */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full bg-emerald-400/40 blur-3xl"
          />

          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotateX: -40 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative glass-strong rounded-3xl px-10 py-8 text-center max-w-md mx-4 glow-emerald"
          >
            <div className="text-[11px] font-display tracking-[0.4em] uppercase text-emerald-300">
              Level Up
            </div>
            <div className="mt-3 text-7xl">🎉</div>
            <div className="mt-3 text-3xl font-display font-black">
              שלב {stageNumber} הושלם!
            </div>
            <div className="mt-1 text-white/70">{stageTitle}</div>

            {/* Sparkles */}
            {[...Array(12)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: Math.cos((i / 12) * Math.PI * 2) * 180,
                  y: Math.sin((i / 12) * Math.PI * 2) * 180,
                }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 text-emerald-300 text-2xl pointer-events-none"
              >
                ✦
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
