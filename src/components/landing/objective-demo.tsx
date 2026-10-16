"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";


const KEY_RESULTS = [
  { id: "sla", title: "Resolve tickets within SLA", unit: "tickets", target: 120, initial: 54 },
  { id: "kb", title: "Publish help-center articles", unit: "articles", target: 12, initial: 5 },
  { id: "playbook", title: "Agents onboarded on the new playbook", unit: "agents", target: 8, initial: 3 },
] as const;

const DAYS_LEFT = 9;

type Status = "NOT_STARTED" | "AT_RISK" | "ON_TRACK" | "COMPLETED";

function statusFor(avg: number): Status {
  if (avg >= 100) return "COMPLETED";
  if (avg <= 0) return "NOT_STARTED";
  if (avg < 30 && DAYS_LEFT < 14) return "AT_RISK";
  return "ON_TRACK";
}

const STATUS_UI: Record<Status, { label: string; dot: string; text: string }> = {
  NOT_STARTED: { label: "Not started", dot: "bg-zinc-400", text: "text-zinc-300" },
  AT_RISK: { label: "At risk", dot: "bg-amber-400", text: "text-amber-300" },
  ON_TRACK: { label: "On track", dot: "bg-emerald-400", text: "text-emerald-300" },
  COMPLETED: { label: "Completed", dot: "bg-[hsl(252,80%,72%)]", text: "text-[hsl(252,80%,82%)]" },
};

const THUMB =
  "[&::-webkit-slider-runnable-track]:h-5 [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[2px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[hsl(252,80%,62%)] " +
  "[&::-webkit-slider-thumb]:bg-[hsl(240,10%,8%)] " +
  "[&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-[hsl(252,80%,62%)] " +
  "[&::-moz-range-thumb]:bg-[hsl(240,10%,8%)] " +
  "focus-visible:[&::-webkit-slider-thumb]:shadow-[0_0_0_4px_hsl(252_80%_62%/0.4)] " +
  "focus-visible:[&::-moz-range-thumb]:shadow-[0_0_0_4px_hsl(252_80%_62%/0.4)]";

export function ObjectiveDemo() {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(KEY_RESULTS.map((k) => [k.id, k.initial]))
  );
  const [ready, setReady] = useState(false); // drives the one-time fill on load
  const [touched, setTouched] = useState(false); // after first drag, bars follow the thumb instantly

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const pcts = KEY_RESULTS.map((k) => Math.round((values[k.id] / k.target) * 100));
  const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  const status = statusFor(avg);
  const ui = STATUS_UI[status];
  const changed = KEY_RESULTS.some((k) => values[k.id] !== k.initial);

  const fillTransition = touched
    ? ""
    : "transition-[width] duration-700 ease-out motion-reduce:transition-none";

  return (
    <figure className="w-full">
      <div className="overflow-hidden rounded-2xl border border-[hsl(240,6%,16%)] bg-[hsl(240,10%,7%)] text-[hsl(0,0%,92%)] shadow-[0_24px_60px_-30px_rgba(20,10,60,0.55)]">
        {/* Objective header */}
        <div className="border-b border-[hsl(240,6%,14%)] px-5 pb-5 pt-5 sm:px-6">
          <div className="flex items-center justify-between gap-3 text-xs text-[hsl(240,4%,60%)]">
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(252,80%,62%)]/25 text-[10px] font-semibold text-[hsl(252,80%,84%)]">
                PN
              </span>
              Priya N., Support lead
            </span>
            <span>{DAYS_LEFT} days left in the quarter</span>
          </div>

          <h3 className="mt-4 font-[family-name:var(--font-lp-display)] text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            Make support faster for new customers
          </h3>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-lp-display)] text-5xl font-semibold tabular-nums leading-none tracking-tight">
                {avg}
              </span>
              <span className="text-lg text-[hsl(240,4%,55%)]">%</span>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium ${ui.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${ui.dot}`} />
              {ui.label}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-[hsl(252,80%,62%)] ${fillTransition}`}
              style={{ width: `${ready ? avg : 0}%` }}
            />
          </div>

          <p className="sr-only" aria-live="polite">
            Objective progress {avg} percent. Status: {ui.label}.
          </p>
        </div>

        {/* Key results */}
        <ul className="divide-y divide-[hsl(240,6%,14%)]">
          {KEY_RESULTS.map((k, i) => {
            const pct = pcts[i];
            const inputId = `lp-kr-${k.id}`;
            return (
              <li key={k.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor={inputId} className="text-sm text-[hsl(0,0%,86%)]">
                    {k.title}
                  </label>
                  <span className="shrink-0 text-xs tabular-nums text-[hsl(240,4%,60%)]">
                    <span className="text-sm font-medium text-[hsl(0,0%,92%)]">{values[k.id]}</span> / {k.target} {k.unit}
                  </span>
                </div>

                <div className="relative mt-3 h-5">
                  <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
                  <div
                    className={`absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[hsl(252,80%,62%)] ${fillTransition}`}
                    style={{
                      width: ready
                        ? `calc(${pct / 100} * (100% - 16px) + 8px)`
                        : "0px",
                    }}
                  />
                  <input
                    id={inputId}
                    type="range"
                    min={0}
                    max={k.target}
                    step={1}
                    value={values[k.id]}
                    onChange={(e) => {
                      setTouched(true);
                      setValues((v) => ({ ...v, [k.id]: Number(e.target.value) }));
                    }}
                    className={`absolute inset-0 h-5 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none ${THUMB}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <figcaption className="mt-4 flex items-start justify-between gap-4 text-sm leading-relaxed text-muted-foreground">
        <span className="max-w-[46ch]">
          Drag a key result. Progress is the average of the key results, and an objective under 30% with
          less than two weeks left is marked At risk. The app does the same sum for you.
        </span>
        <button
          type="button"
          onClick={() => {
            setTouched(false);
            setValues(Object.fromEntries(KEY_RESULTS.map((k) => [k.id, k.initial])));
          }}
          disabled={!changed}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground transition-opacity hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(252,80%,62%)] disabled:pointer-events-none disabled:opacity-0"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </figcaption>
    </figure>
  );
}
