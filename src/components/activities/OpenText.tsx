"use client";

import { useState } from "react";
import type { OpenTextActivity } from "@/lib/questData";
import { useQuest } from "@/lib/quest-context";

interface Props {
  activity: OpenTextActivity;
  onComplete: () => void;
}

export function OpenTextUI({ activity, onComplete }: Props) {
  const { completeActivity, session } = useQuest();
  const previous = session?.answers[activity.id] as Record<string, string> | undefined;

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of activity.fields) init[f.id] = previous?.[f.id] ?? "";
    return init;
  });

  function setField(id: string, v: string) {
    setValues((p) => ({ ...p, [id]: v }));
  }

  function valid() {
    return activity.fields.every((f) => {
      const v = (values[f.id] ?? "").trim();
      const min = f.minLength ?? 4;
      return v.length >= min;
    });
  }

  function submit() {
    completeActivity(activity.id, values, activity.xp);
    onComplete();
  }

  return (
    <div>
      <p className="text-lg font-semibold mb-2 leading-relaxed">{activity.question}</p>
      {activity.helper && <p className="text-sm text-white/55 mb-5">{activity.helper}</p>}

      <div className="space-y-4">
        {activity.fields.map((f) => (
          <label key={f.id} className="block">
            <span className="block text-sm font-semibold text-white/75 mb-1.5">{f.label}</span>
            {f.rows && f.rows > 1 ? (
              <textarea
                className="field"
                placeholder={f.placeholder}
                rows={f.rows}
                value={values[f.id]}
                onChange={(e) => setField(f.id, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="field"
                placeholder={f.placeholder}
                value={values[f.id]}
                onChange={(e) => setField(f.id, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button type="button" onClick={submit} disabled={!valid()} className="btn-primary">
          שמרו והמשיכו ←
        </button>
      </div>
    </div>
  );
}
