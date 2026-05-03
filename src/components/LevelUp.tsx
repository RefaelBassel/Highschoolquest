"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
  show: boolean;
  stageNumber: number;
  stageTitle: string;
  onClose: () => void;
}

// Lightweight Level-Up toast: no backdrop blur, no GPU-heavy radial bursts,
// short and simple. Heavy effects crash some integrated-graphics tabs.
export function LevelUp({ show, stageNumber, stageTitle, onClose }: Props) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onCloseRef.current(), 1600);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/75"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="rounded-3xl px-10 py-8 text-center max-w-md mx-4 border border-emerald-300/40 bg-[rgba(8,7,18,0.95)] shadow-[0_0_60px_-10px_rgba(16,255,168,0.55)]"
          >
            <div className="text-[11px] font-display tracking-[0.4em] uppercase text-emerald-300">
              Level Up
            </div>
            <div className="mt-3 text-6xl">🎉</div>
            <div className="mt-3 text-3xl font-display font-black">
              שלב {stageNumber} הושלם!
            </div>
            <div className="mt-1 text-white/70">{stageTitle}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
