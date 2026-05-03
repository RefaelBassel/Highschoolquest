"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useQuest } from "@/lib/quest-context";
import { STAGES } from "@/lib/questData";
import { Landing } from "./Landing";
import { ProgressBar } from "./ProgressBar";
import { Stage1 } from "./stages/Stage1";
import { StageGeneric } from "./stages/StageGeneric";
import { LevelUp } from "./LevelUp";
import { Summary } from "./Summary";

export function QuestApp() {
  const { session, loading, goToStep, markCompleted } = useQuest();
  const [levelUpStage, setLevelUpStage] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="text-3xl animate-pulse">⚡</div>
          <div className="text-white/40 text-sm">טוען…</div>
        </div>
      </div>
    );
  }

  if (!session) return <Landing />;

  const isComplete = !!session.completedAt;

  function advanceFromStage(stage: 1 | 2 | 3 | 4) {
    setLevelUpStage(stage);
    setTimeout(() => {
      if (stage === 4) {
        // After stage 4 → mark complete and show summary
        markCompleted();
      } else {
        goToStep((stage + 1) as 1 | 2 | 3 | 4);
      }
      setLevelUpStage(null);
    }, 2400);
  }

  if (isComplete) {
    return (
      <>
        <ProgressBar />
        <Summary />
      </>
    );
  }

  return (
    <>
      <ProgressBar />
      <AnimatePresence mode="wait">
        <motion.div
          key={session.currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {session.currentStep === 1 && <Stage1 onStageComplete={() => advanceFromStage(1)} />}
          {session.currentStep === 2 && (
            <StageGeneric stageNumber={2} onStageComplete={() => advanceFromStage(2)} />
          )}
          {session.currentStep === 3 && (
            <StageGeneric stageNumber={3} onStageComplete={() => advanceFromStage(3)} />
          )}
          {session.currentStep === 4 && (
            <StageGeneric stageNumber={4} onStageComplete={() => advanceFromStage(4)} />
          )}
        </motion.div>
      </AnimatePresence>

      <LevelUp
        show={levelUpStage !== null}
        stageNumber={levelUpStage ?? 1}
        stageTitle={STAGES.find((s) => s.number === levelUpStage)?.title ?? ""}
        onClose={() => setLevelUpStage(null)}
      />

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-white/30">
        קוד הסשן שלך: <span className="font-mono text-white/45">{session.id}</span>
      </footer>
    </>
  );
}
