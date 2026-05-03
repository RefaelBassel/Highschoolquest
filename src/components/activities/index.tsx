"use client";

import type { Activity } from "@/lib/questData";
import { ActivityShell } from "../ActivityShell";
import { MultipleChoiceUI } from "./MultipleChoice";
import { DragDropUI } from "./DragDrop";
import { SortCategoriesUI } from "./SortCategories";
import { FlipCardUI, FlipCardDeck } from "./FlipCard";
import { HotspotUI } from "./Hotspot";
import { MatchingUI } from "./Matching";
import { OpenTextUI } from "./OpenText";
import { ExternalEntryUI } from "./ExternalEntry";

interface RenderProps {
  activity: Activity;
  index: number;
  total: number;
  accentClass: string;
  onComplete: () => void;
}

export function ActivityRenderer({ activity, index, total, accentClass, onComplete }: RenderProps) {
  if (activity.kind === "narrative-card") {
    // Narrative cards are full-bleed in stage 1; rendered separately by Stage1.
    return null;
  }
  return (
    <ActivityShell
      activityId={activity.id}
      index={index}
      total={total}
      title={activity.title}
      prompt={activity.prompt}
      xp={activity.xp}
      accentClass={accentClass}
    >
      <Inner activity={activity} onComplete={onComplete} />
    </ActivityShell>
  );
}

function Inner({ activity, onComplete }: { activity: Activity; onComplete: () => void }) {
  switch (activity.kind) {
    case "multiple-choice":
      return <MultipleChoiceUI activity={activity} onComplete={onComplete} />;
    case "drag-drop":
      return <DragDropUI activity={activity} onComplete={onComplete} />;
    case "sort-categories":
      return <SortCategoriesUI activity={activity} onComplete={onComplete} />;
    case "flip-card":
      return <FlipCardUI activity={activity} onComplete={onComplete} />;
    case "flip-card-deck":
      return <FlipCardDeck activity={activity} onComplete={onComplete} />;
    case "hotspot":
      return <HotspotUI activity={activity} onComplete={onComplete} />;
    case "matching":
      return <MatchingUI activity={activity} onComplete={onComplete} />;
    case "open-text":
      return <OpenTextUI activity={activity} onComplete={onComplete} />;
    case "external-entry":
      return <ExternalEntryUI activity={activity} onComplete={onComplete} />;
    default:
      return null;
  }
}
