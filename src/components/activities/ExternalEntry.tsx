"use client";

import { useState } from "react";
import type { ExternalEntryActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

interface Props {
  activity: ExternalEntryActivity;
  onComplete: () => void;
}

export function ExternalEntryUI({ activity, onComplete }: Props) {
  const { completeActivity, session } = useQuest();
  const previous = session?.answers[activity.id] as Record<string, string> | undefined;
  const [opened, setOpened] = useState<boolean>(!!previous);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of activity.fields) init[f.id] = previous?.[f.id] ?? "";
    return init;
  });

  function setField(id: string, v: string) {
    setValues((p) => ({ ...p, [id]: v }));
  }

  function valid() {
    return activity.fields.every((f) => (values[f.id] ?? "").trim().length >= 1);
  }

  function open() {
    setOpened(true);
    if (typeof window !== "undefined") {
      window.open(activity.externalUrl, "_blank", "noopener,noreferrer");
    }
  }

  function submit() {
    completeActivity(activity.id, values, activity.xp);
    onComplete();
  }

  return (
    <div>
      <p className="text-lg font-semibold mb-4 leading-relaxed">{activity.question}</p>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🌐</div>
          <div>
            <div className="font-semibold">{activity.externalLabel}</div>
            <div className="text-xs text-white/55 break-all">{activity.externalUrl}</div>
          </div>
        </div>
        <button type="button" onClick={open} className="btn-primary !py-2 !px-4 !text-sm">
          {opened ? "פתחו שוב" : "פתחו את הקטלוג"} ↗
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {activity.fields.map((f) => (
          <label key={f.id} className="block">
            <span className="block text-sm font-semibold text-white/75 mb-1.5">{f.label}</span>
            <input
              type="text"
              className="field"
              placeholder={f.placeholder}
              value={values[f.id]}
              onChange={(e) => setField(f.id, e.target.value)}
            />
            {f.suggestion && <span className="block text-[11px] text-white/40 mt-1">💡 {f.suggestion}</span>}
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-xs text-white/45">
          {opened ? "✓ פתחתם את הקטלוג" : "פתחו את הקטלוג כדי לראות מגמות אמיתיות"}
        </span>
        <button type="button" onClick={submit} disabled={!valid()} className="btn-primary">
          שמרו והמשיכו ←
        </button>
      </div>
    </div>
  );
}
