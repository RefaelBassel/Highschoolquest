"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useQuest } from "@/lib/quest-context";
import { CLASSES, STAGES, TOTAL_ACTIVITIES, TOTAL_XP } from "@/lib/questData";

export function Landing() {
  const { startSession, error, loading } = useQuest();
  const [name, setName] = useState("");
  const [klass, setKlass] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canStart = name.trim().length >= 2 && !!klass;

  async function start() {
    if (!canStart) return;
    setSubmitting(true);
    await startSession(name, klass);
    setSubmitting(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundOrbs />

      <main className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <span className="pulse-dot" />
            <span className="font-display tracking-widest uppercase text-[11px]">
              Shacharit · Quest 1.0
            </span>
          </div>
          <div className="text-xs text-white/40">קוויסט אינטראקטיבי</div>
        </motion.div>

        {/* Hero */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.7 }}
          className="font-display font-black text-5xl sm:text-7xl leading-[1.05] tracking-tight"
        >
          עולים{" "}
          <span className="bg-gradient-to-l from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent text-glow-emerald">
            לשחרית
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-lg sm:text-xl text-white/75 max-w-2xl leading-relaxed"
        >
          ארבעה שלבים. עשרים ואחת משימות. אלף ומאתיים נקודות. בסוף הקוויסט תכירו את שחרית
          מהמסלול עד הבחירות הקטנות שמרכיבות אותו — ותתחילו את י׳ עם תוכנית אמיתית.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-10 grid grid-cols-3 gap-3 max-w-2xl"
        >
          <Stat icon="🎯" label="שלבים" value="4" accent="violet" />
          <Stat icon="⚡" label="משימות" value={String(TOTAL_ACTIVITIES)} accent="emerald" />
          <Stat icon="✨" label="XP מקסימלי" value={TOTAL_XP.toLocaleString("he-IL")} accent="amber" />
        </motion.div>

        {/* Stage preview cards */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES.map((s, idx) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.08 }}
              className="glass rounded-2xl p-5 hover:translate-y-[-2px] transition-transform"
            >
              <div className="text-3xl">{s.emoji}</div>
              <div className="mt-2 text-[11px] font-display uppercase tracking-widest text-white/45">
                שלב {s.number}
              </div>
              <div className="font-bold text-lg mt-0.5">{s.title}</div>
              <div className="text-xs text-white/55 mt-1.5 leading-relaxed line-clamp-3">
                {s.description}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-white/55">
                <span>{s.activities.length} משימות</span>
                <span className="text-amber-300 font-bold">
                  +{s.activities.reduce((a, b) => a + b.xp, 0)} XP
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sign-in card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 glass-strong rounded-3xl p-6 sm:p-8 max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 grid place-items-center text-lg">
              👋
            </div>
            <div>
              <div className="font-bold text-lg">בואו נתחיל</div>
              <div className="text-xs text-white/55">פרטים קצרים — והקוויסט בדרך</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <input
              type="text"
              className="field"
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoFocus
            />
            <select
              className="field"
              value={klass}
              onChange={(e) => setKlass(e.target.value)}
              aria-label="כיתה"
            >
              <option value="">כיתה…</option>
              {CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mt-3 text-sm text-rose-300 bg-rose-400/10 border border-rose-400/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs text-white/45">
              ההתקדמות שלכם נשמרת אוטומטית — תוכלו לחזור בכל עת באותו דפדפן.
            </span>
            <button
              type="button"
              onClick={start}
              disabled={!canStart || submitting || loading}
              className="btn-primary"
            >
              {submitting ? "טוען…" : "התחילו את הקוויסט"} ←
            </button>
          </div>
        </motion.div>

        <div className="mt-10 text-center text-xs text-white/40">
          התקדמתם כבר? פתחו באותו דפדפן ונחזור בדיוק לאן שעצרתם.
        </div>
      </main>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: "emerald" | "violet" | "amber";
}) {
  const ringMap = {
    emerald: "from-emerald-400/30 to-cyan-400/10 text-emerald-200",
    violet: "from-violet-400/30 to-fuchsia-400/10 text-violet-200",
    amber: "from-amber-400/30 to-orange-400/10 text-amber-200",
  } as const;
  return (
    <div className={`glass rounded-2xl p-4 bg-gradient-to-br ${ringMap[accent]}`}>
      <div className="text-2xl">{icon}</div>
      <div className="text-xs uppercase tracking-widest text-white/55 mt-1 font-display">{label}</div>
      <div className="text-2xl font-display font-black tabular-nums">{value}</div>
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="orb"
        style={{ top: "-10%", right: "-5%", width: 380, height: 380, background: "#a78bfa" }}
      />
      <div
        className="orb"
        style={{ top: "30%", left: "-10%", width: 460, height: 460, background: "#10ffa8", animationDelay: "2s" }}
      />
      <div
        className="orb"
        style={{ bottom: "-15%", right: "20%", width: 520, height: 520, background: "#38bdf8", animationDelay: "4s" }}
      />
    </div>
  );
}
