
"use client";

import { useState, useTransition } from "react";
import { Sparkles, Plus, ChevronRight, Lock } from "lucide-react";
import { getAIOKRSuggestions } from "@/actions/ai-suggestions.actions";
import type { Plan } from "@/lib/plan-config";
import { canUseFeature } from "@/lib/plan-config";

export function AIOKRSuggestions({
  plan,
  onSelect,
}: {
  plan:     Plan;
  onSelect: (title: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hint,        setHint]        = useState("");
  const [loaded,      setLoaded]      = useState(false);
  const [pending, start]              = useTransition();
  const canUse = canUseFeature(plan, "okrAiSuggestions");

  function load() {
    if (!canUse || loaded) return;
    start(async () => {
      const res = await getAIOKRSuggestions();
      if (res.success) {
        setSuggestions(res.suggestions);
        setHint(res.hint ?? "");
        setLoaded(true);
      }
    });
  }

  if (!canUse) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
        <Lock size={12} className="flex-shrink-0"/>
        AI OKR suggestions require Enterprise plan
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={load} disabled={pending}
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
        <Sparkles size={13}/>
        {pending ? "Thinking..." : loaded ? "Refresh suggestions" : "✨ Get AI suggestions"}
      </button>

      {loaded && suggestions.length > 0 && (
        <div className="space-y-1.5">
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
          {suggestions.map((s, i) => (
            <button key={i} type="button" onClick={() => onSelect(s)}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 text-left transition-colors group">
              <Plus size={12} className="text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"/>
              <span className="text-xs text-foreground flex-1">{s}</span>
              <ChevronRight size={11} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

