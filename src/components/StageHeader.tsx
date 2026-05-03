"use client";

import { motion } from "framer-motion";

const accent = {
  emerald: { text: "text-emerald-200", glow: "text-glow-emerald" },
  sky: { text: "text-sky-200", glow: "text-glow-sky" },
  violet: { text: "text-violet-200", glow: "text-glow-violet" },
  amber: { text: "text-amber-200", glow: "text-glow-amber" },
} as const;

interface Props {
  number: number;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  accent: keyof typeof accent;
}

export function StageHeader({ number, emoji, title, subtitle, description, accent: a }: Props) {
  const c = accent[a];
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 sm:mb-10 text-center"
    >
      <div className={`text-[11px] font-display tracking-[0.4em] uppercase ${c.text}`}>
        Stage {number} · {subtitle}
      </div>
      <div className="mt-2 text-5xl drop-shadow">{emoji}</div>
      <h2 className={`mt-2 text-3xl sm:text-4xl font-display font-black ${c.glow}`}>{title}</h2>
      <p className="mt-3 text-white/65 max-w-2xl mx-auto leading-relaxed">{description}</p>
    </motion.div>
  );
}
