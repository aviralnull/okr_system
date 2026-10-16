"use client";

import { useRef, useState } from "react";
import { ChevronDown, Star } from "lucide-react";

/* ───────────────────────── shared bits ───────────────────────── */

const PANEL =
  "overflow-hidden rounded-2xl border border-[hsl(240,6%,16%)] bg-[hsl(240,10%,7%)] text-[hsl(0,0%,92%)] shadow-[0_24px_60px_-30px_rgba(20,10,60,0.55)]";
const RULE = "border-[hsl(240,6%,14%)]";
const MUTED = "text-[hsl(240,4%,60%)]";
const ACCENT = "bg-[hsl(252,80%,62%)]";
const RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(252,80%,62%)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(240,10%,7%)]";

type Status = "NOT_STARTED" | "AT_RISK" | "ON_TRACK" | "BEHIND" | "COMPLETED";

const STATUS_UI: Record<Status, { label: string; dot: string; text: string; bar: string }> = {
  NOT_STARTED: { label: "Not started", dot: "bg-zinc-500", text: "text-zinc-300", bar: "bg-zinc-500" },
  AT_RISK: { label: "At risk", dot: "bg-amber-400", text: "text-amber-300", bar: "bg-amber-400" },
  ON_TRACK: { label: "On track", dot: "bg-emerald-400", text: "text-emerald-300", bar: "bg-emerald-400" },
  BEHIND: { label: "Behind", dot: "bg-rose-400", text: "text-rose-300", bar: "bg-rose-400" },
  COMPLETED: { label: "Completed", dot: "bg-[hsl(252,80%,72%)]", text: "text-[hsl(252,80%,82%)]", bar: "bg-[hsl(252,80%,66%)]" },
};

// Same thresholds the app uses when a key result is logged.
function statusFor(avg: number, daysLeft: number): Status {
  if (avg >= 100) return "COMPLETED";
  if (avg <= 0) return "NOT_STARTED";
  if (daysLeft < 0) return "BEHIND";
  if (avg < 30 && daysLeft < 14) return "AT_RISK";
  return "ON_TRACK";
}

function Initials({ text }: { text: string }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(252,80%,62%)]/25 text-[10px] font-semibold text-[hsl(252,80%,84%)]">
      {text}
    </span>
  );
}

function PanelBar({ title, right }: { title: string; right?: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b ${RULE} px-5 py-3.5 text-sm sm:px-6`}>
      <span className="font-medium">{title}</span>
      {right ? <span className={`text-xs ${MUTED}`}>{right}</span> : null}
    </div>
  );
}

function SampleNote() {
  return <p className={`border-t ${RULE} px-5 py-3 text-xs ${MUTED} sm:px-6`}>Sample data, for illustration.</p>;
}

/* ───────────────────────── 1. objectives ───────────────────────── */

type KR = { t: string; cur: number; tgt: number; unit: string };
type Obj = { id: string; title: string; who: string; ini: string; priority: "Critical" | "High" | "Medium" | "Low"; days: number; krs: KR[] };

const OBJECTIVES: Obj[] = [
  {
    id: "deals", title: "Close 40 enterprise deals", who: "Ananya K.", ini: "AK", priority: "Critical", days: 31,
    krs: [
      { t: "Deals closed", cur: 26, tgt: 40, unit: "deals" },
      { t: "Demos completed", cur: 58, tgt: 80, unit: "demos" },
    ],
  },
  {
    id: "onboarding", title: "Cut onboarding time for new customers", who: "Rohan D.", ini: "RD", priority: "High", days: 12,
    krs: [
      { t: "Setup guides published", cur: 2, tgt: 10, unit: "guides" },
      { t: "Customers moved to the new flow", cur: 11, tgt: 60, unit: "customers" },
    ],
  },
  {
    id: "mobile", title: "Ship the mobile app beta", who: "Meera S.", ini: "MS", priority: "High", days: 26,
    krs: [
      { t: "Screens signed off", cur: 17, tgt: 24, unit: "screens" },
      { t: "Beta testers enrolled", cur: 40, tgt: 50, unit: "testers" },
    ],
  },
  {
    id: "hiring", title: "Hire the engineering team for Q3", who: "Kabir M.", ini: "KM", priority: "Medium", days: 5,
    krs: [
      { t: "Offers accepted", cur: 4, tgt: 4, unit: "offers" },
      { t: "Interviews completed", cur: 20, tgt: 20, unit: "interviews" },
    ],
  },
];

const PRIORITY_TEXT: Record<Obj["priority"], string> = {
  Critical: "text-rose-300",
  High: "text-amber-300",
  Medium: "text-sky-300",
  Low: "text-zinc-400",
};

const krPct = (k: KR) => Math.min(100, Math.round((k.cur / k.tgt) * 100));

function ObjectivesMock() {
  const [open, setOpen] = useState<string | null>("onboarding");

  return (
    <div className={PANEL}>
      <PanelBar title="Objectives" right="Q3 2026" />
      <ul>
        {OBJECTIVES.map((o) => {
          const avg = Math.round(o.krs.reduce((a, k) => a + krPct(k), 0) / o.krs.length);
          const ui = STATUS_UI[statusFor(avg, o.days)];
          const expanded = open === o.id;
          return (
            <li key={o.id} className={`border-b ${RULE} last:border-b-0`}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : o.id)}
                className={`block w-full px-5 py-4 text-left transition-colors hover:bg-white/[0.03] sm:px-6 ${RING} focus-visible:ring-inset`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{o.title}</p>
                    <p className={`mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${MUTED}`}>
                      <span className="flex items-center gap-1.5">
                        <Initials text={o.ini} />
                        {o.who}
                      </span>
                      <span className={PRIORITY_TEXT[o.priority]}>{o.priority}</span>
                      <span>{o.days} days left</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{avg}%</p>
                      <p className={`flex items-center justify-end gap-1.5 text-xs ${ui.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${ui.dot}`} />
                        {ui.label}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`${MUTED} transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${ui.bar}`} style={{ width: `${avg}%` }} />
                </div>
              </button>

              {expanded ? (
                <ul className={`border-t ${RULE} bg-white/[0.02] px-5 py-3 sm:px-6`}>
                  {o.krs.map((k) => (
                    <li key={k.t} className="py-2">
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span className="text-[hsl(0,0%,84%)]">{k.t}</span>
                        <span className={`shrink-0 text-xs tabular-nums ${MUTED}`}>
                          <span className="text-sm text-[hsl(0,0%,92%)]">{k.cur}</span> / {k.tgt} {k.unit}
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${ACCENT}`} style={{ width: `${krPct(k)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      <SampleNote />
    </div>
  );
}

/* ───────────────────────── 2. dashboards ───────────────────────── */

type DashData = {
  name: string;
  stats: readonly (readonly [string, string])[];
  status: readonly number[];
  trend: readonly number[];
};

const DASH: Record<"admin" | "manager" | "employee", DashData> = {
  admin: {
    name: "Org admin",
    stats: [["Total employees", "42"], ["Total objectives", "118"], ["Avg completion", "61%"], ["At risk", "9"]],
    status: [24, 61, 9, 6, 18],
    trend: [28, 35, 41, 49, 55, 61],
  },
  manager: {
    name: "Manager",
    stats: [["Team members", "8"], ["Team OKRs", "21"], ["Avg completion", "68%"], ["Reviews pending", "3"]],
    status: [5, 11, 2, 1, 2],
    trend: [31, 40, 48, 57, 63, 68],
  },
  employee: {
    name: "Employee",
    stats: [["My OKRs", "4"], ["Key results", "11"], ["Avg completion", "54%"], ["Avg rating", "4.2"]],
    status: [1, 2, 1, 0, 0],
    trend: [12, 22, 31, 40, 47, 54],
  },
};

type DashKey = keyof typeof DASH;
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
// order matches the `status` arrays above
const STATUS_ORDER: Status[] = ["COMPLETED", "ON_TRACK", "AT_RISK", "BEHIND", "NOT_STARTED"];

function Trend({ values }: { values: readonly number[] }) {
  const W = 300;
  const H = 92;
  const pts = values.map((v, i) => [10 + (i * (W - 20)) / (values.length - 1), 74 - (v / 100) * 62] as const);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Completion trend: ${values.map((v, i) => `${MONTHS[i]} ${v}%`).join(", ")}`}>
      {[0, 50, 100].map((g) => (
        <line key={g} x1="10" x2={W - 10} y1={74 - (g / 100) * 62} y2={74 - (g / 100) * 62} stroke="hsl(240,6%,16%)" strokeWidth="1" />
      ))}
      <polyline fill="none" stroke="hsl(252,80%,66%)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts.map((p) => p.join(",")).join(" ")} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.5 : 2} fill={i === pts.length - 1 ? "hsl(252,80%,72%)" : "hsl(240,10%,7%)"} stroke="hsl(252,80%,66%)" strokeWidth="1.5" />
      ))}
      {pts.map(([x], i) => (
        <text key={i} x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="hsl(240,4%,55%)">
          {MONTHS[i]}
        </text>
      ))}
    </svg>
  );
}

function DashboardsMock() {
  const [role, setRole] = useState<DashKey>("admin");
  const d = DASH[role];
  const total = d.status.reduce((a, b) => a + b, 0);

  return (
    <div className={PANEL}>
      <div className={`flex items-center justify-between gap-3 border-b ${RULE} px-5 py-3 sm:px-6`}>
        <span className="text-sm font-medium">Dashboard</span>
        <div role="group" aria-label="Preview as" className="flex rounded-lg bg-white/[0.06] p-0.5 text-xs">
          {(Object.keys(DASH) as DashKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={role === k}
              onClick={() => setRole(k)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${RING} ${
                role === k ? "bg-white/[0.14] text-white" : "text-[hsl(240,4%,60%)] hover:text-white"
              }`}
            >
              {DASH[k].name}
            </button>
          ))}
        </div>
      </div>

      <dl className={`grid grid-cols-2 border-b ${RULE} sm:grid-cols-4`}>
        {d.stats.map(([label, value], i) => (
          <div key={label} className={`px-5 py-4 sm:px-6 ${i % 2 === 1 ? "border-l" : ""} ${i > 0 ? "sm:border-l" : ""} ${i > 1 ? `border-t sm:border-t-0` : ""} ${RULE}`}>
            <dt className={`text-xs ${MUTED}`}>{label}</dt>
            <dd className="mt-1 font-[family-name:var(--font-lp-display)] text-2xl font-semibold tabular-nums tracking-tight">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 px-5 py-5 sm:px-6">
        <div>
          <p className="text-sm font-medium">OKR status</p>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            {d.status.map((n, i) => (
              <div key={i} className={`${STATUS_UI[STATUS_ORDER[i]].bar} transition-[width] duration-500 motion-reduce:transition-none`} style={{ width: `${(n / total) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
            {d.status.map((n, i) => (
              <li key={i} className={`flex items-center gap-1.5 ${MUTED}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_UI[STATUS_ORDER[i]].dot}`} />
                {STATUS_UI[STATUS_ORDER[i]].label}
                <span className="tabular-nums text-[hsl(0,0%,88%)]">{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium">Completion trend</p>
          <div className="mt-2">
            <Trend values={d.trend} />
          </div>
        </div>
      </div>
      <SampleNote />
    </div>
  );
}

/* ───────────────────────── 3. reviews ───────────────────────── */

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} of 5`}
          onClick={() => onChange(n)}
          className={`rounded p-0.5 ${RING}`}
        >
          <Star size={20} className={n <= value ? "fill-amber-400 text-amber-400" : "text-[hsl(240,4%,34%)]"} />
        </button>
      ))}
    </div>
  );
}

function ReadField({ label, value, tall }: { label: string; value: string; tall?: boolean }) {
  return (
    <div>
      <p className={`text-xs ${MUTED}`}>{label}</p>
      <p className={`mt-1.5 rounded-lg border ${RULE} bg-white/[0.03] px-3 py-2 text-sm leading-relaxed ${tall ? "min-h-[4.5rem]" : ""}`}>{value}</p>
    </div>
  );
}

function ReviewsMock() {
  const [view, setView] = useState<"performance" | "peer">("performance");
  const [rating, setRating] = useState(4);

  return (
    <div className={PANEL}>
      <div className={`flex border-b ${RULE} px-3 text-sm sm:px-4`} role="tablist" aria-label="Review type">
        {([["performance", "Performance reviews"], ["peer", "360° peer reviews"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`-mb-px border-b-2 px-3 py-3.5 font-medium transition-colors ${RING} focus-visible:ring-inset ${
              view === id ? "border-[hsl(252,80%,62%)] text-white" : "border-transparent text-[hsl(240,4%,60%)] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 px-5 py-5 sm:px-6">
        {view === "performance" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadField label="Employee" value="Aarav Mehta" />
              <ReadField label="Review period" value="Q2 2026" />
            </div>
            <div>
              <p className={`text-xs ${MUTED}`}>Rating</p>
              <div className="mt-1.5 flex items-center gap-3">
                <Stars value={rating} onChange={setRating} />
                <span className="text-sm tabular-nums text-[hsl(0,0%,88%)]">{rating} of 5</span>
              </div>
            </div>
            <ReadField tall label="What did this employee do well?" value="Took ownership of the onboarding rewrite and kept every key result updated weekly." />
            <ReadField tall label="What could be improved?" value="Raise blockers earlier. Two key results slipped before anyone saw them." />
          </>
        ) : (
          <>
            <p className="text-sm text-[hsl(0,0%,84%)]">Ask colleagues to review you this quarter, or give a review to someone you work with.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadField label="Colleague" value="Neha Sharma" />
              <ReadField label="Review period" value="Q2 2026" />
            </div>
            <div>
              <p className={`text-xs ${MUTED}`}>Rating</p>
              <div className="mt-1.5 flex items-center gap-3">
                <Stars value={rating} onChange={setRating} />
                <span className="text-sm tabular-nums text-[hsl(0,0%,88%)]">{rating} of 5</span>
              </div>
            </div>
            <ReadField tall label="What does this person do really well?" value="Explains trade-offs clearly and makes the whole team's goals easier to follow." />
            <ReadField tall label="Any suggestions for growth?" value="Delegate more of the reporting so there is time for the harder problems." />
          </>
        )}
      </div>
      <SampleNote />
    </div>
  );
}

/* ───────────────────────── 4. approvals ───────────────────────── */

type Approval = "pending" | "revising" | "approved" | "sentBack";

function ApprovalsMock() {
  const [state, setState] = useState<Approval>("pending");
  const [showKrs, setShowKrs] = useState(true);
  const [note, setNote] = useState("");

  const krs = ["Launch the referral page", "Reach 150 referred sign-ups", "Reward 40 referrers"];

  return (
    <div className={PANEL}>
      <PanelBar title="Approvals" right={state === "pending" || state === "revising" ? "1 waiting" : "0 waiting"} />

      {state === "approved" || state === "sentBack" ? (
        <div className="px-5 py-8 sm:px-6">
          <p className="font-[family-name:var(--font-lp-display)] text-xl font-semibold tracking-tight">
            {state === "approved" ? "Approved" : "Sent back for changes"}
          </p>
          <p className={`mt-2 max-w-[44ch] text-sm leading-relaxed ${MUTED}`}>
            {state === "approved"
              ? "Rohan D. gets a notification that “Launch the referral program” was approved."
              : `Rohan D. gets a notification with your note: “${note.trim()}”`}
          </p>
          <button
            type="button"
            onClick={() => {
              setState("pending");
              setNote("");
            }}
            className={`mt-6 rounded-lg border ${RULE} px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white/[0.05] ${RING}`}
          >
            Start over
          </button>
        </div>
      ) : (
        <div className="px-5 py-5 sm:px-6">
          <p className={`text-xs ${MUTED}`}>Rohan D. sent this for your approval</p>
          <p className="mt-1.5 text-base font-medium leading-snug">Launch the referral program</p>
          <p className={`mt-1.5 flex flex-wrap gap-x-3 text-xs ${MUTED}`}>
            <span className="text-amber-300">High</span>
            <span>Q3 2026</span>
            <span>3 key results</span>
          </p>

          <button
            type="button"
            onClick={() => setShowKrs((v) => !v)}
            aria-expanded={showKrs}
            className={`mt-4 inline-flex items-center gap-1.5 rounded text-xs font-medium text-[hsl(252,80%,80%)] ${RING}`}
          >
            {showKrs ? "Hide key results" : "Show key results"}
            <ChevronDown size={12} className={`transition-transform motion-reduce:transition-none ${showKrs ? "rotate-180" : ""}`} />
          </button>

          {showKrs ? (
            <ul className={`mt-3 divide-y ${RULE} rounded-lg border ${RULE}`}>
              {krs.map((k) => (
                <li key={k} className="px-3.5 py-2.5 text-sm text-[hsl(0,0%,86%)]">
                  {k}
                </li>
              ))}
            </ul>
          ) : null}

          {state === "revising" ? (
            <div className="mt-5">
              <label htmlFor="lp-revise" className={`text-xs ${MUTED}`}>
                Note for the employee
              </label>
              <textarea
                id="lp-revise"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Tell the employee what needs to be revised..."
                className={`mt-1.5 w-full resize-none rounded-lg border ${RULE} bg-white/[0.03] px-3 py-2 text-sm placeholder:text-[hsl(240,4%,42%)] ${RING}`}
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!note.trim()}
                  onClick={() => setState("sentBack")}
                  className={`rounded-lg ${ACCENT} px-3.5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40 ${RING}`}
                >
                  Send back
                </button>
                <button
                  type="button"
                  onClick={() => setState("pending")}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium text-[hsl(240,4%,70%)] hover:text-white ${RING}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setState("approved")}
                className={`rounded-lg ${ACCENT} px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[hsl(252,80%,56%)] ${RING}`}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setState("revising")}
                className={`rounded-lg border ${RULE} px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white/[0.05] ${RING}`}
              >
                Request changes
              </button>
            </div>
          )}
        </div>
      )}
      <SampleNote />
    </div>
  );
}

/* ───────────────────────── the tour ───────────────────────── */

const TABS = [
  {
    id: "objectives",
    label: "Objectives",
    headline: "Objectives that carry their own numbers",
    body: "Every objective holds its key results, priority and dates. Open one in the list to see what is underneath the percentage.",
    points: [
      "Priority from Low to Critical, and the quarter it belongs to",
      "Key results with a target, a unit and a starting value",
      "Assign to one person, a team or a department. Each member gets their own copy to track",
    ],
    from: "Every plan. Team and department assignment from Pro.",
    Panel: ObjectivesMock,
  },
  {
    id: "dashboards",
    label: "Dashboards",
    headline: "A dashboard for the job each person does",
    body: "Switch the preview between roles. Each one lands on a dashboard with the numbers that role acts on.",
    points: [
      "Admins see people, objectives, teams, plan and pending invitations",
      "Managers see their team's OKRs, member performance and reviews waiting",
      "Employees see their own OKRs, progress trend, notifications and manager feedback",
    ],
    from: "Every plan",
    Panel: DashboardsMock,
  },
  {
    id: "reviews",
    label: "Reviews",
    headline: "Reviews written against the quarter's results",
    body: "Give a rating, say what went well and what could be better, for a period you name, like Q2 2026 or Annual 2025.",
    points: [
      "Managers and HR write reviews. Employees read them on their dashboard",
      "Ask colleagues for 360° feedback, or give some to a colleague",
      "Business adds custom review templates",
    ],
    from: "Reviews from Pro. Peer feedback on Enterprise.",
    Panel: ReviewsMock,
  },
  {
    id: "approvals",
    label: "Approvals",
    headline: "Agree on the goal before the work starts",
    body: "Try it. Approve the OKR, or request changes and write a note.",
    points: [
      "The owner sends an OKR for approval and their manager is notified",
      "Approve it, or send it back with a note on what to revise",
      "The owner is notified of the decision either way",
    ],
    from: "Business and up",
    Panel: ApprovalsMock,
  },
] as const;

export function ProductTour() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(to: number) {
    const next = (to + TABS.length) % TABS.length;
    setActive(next);
    refs.current[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); move(active + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); move(active - 1); }
    else if (e.key === "Home") { e.preventDefault(); move(0); }
    else if (e.key === "End") { e.preventDefault(); move(TABS.length - 1); }
  }

  const tab = TABS[active];
  const Panel = tab.Panel;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Parts of OKR Desk"
        onKeyDown={onKeyDown}
        className="-mx-5 flex overflow-x-auto border-b border-border px-5 sm:mx-0 sm:px-0"
      >
        {TABS.map((t, i) => {
          const selected = i === active;
          return (
            <button
              key={t.id}
              ref={(el) => { refs.current[i] = el; }}
              role="tab"
              id={`tour-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`tour-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={
                "-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(252,80%,62%)] sm:px-5 " +
                (selected ? "border-[hsl(252,80%,62%)] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`tour-panel-${tab.id}`}
        aria-labelledby={`tour-tab-${tab.id}`}
        tabIndex={0}
        className="mt-10 grid items-start gap-10 focus-visible:outline-none lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14"
      >
        <div>
          <h3 className="font-[family-name:var(--font-lp-display)] text-2xl font-semibold leading-snug tracking-tight">{tab.headline}</h3>
          <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-muted-foreground">{tab.body}</p>
          <ul className="mt-6 border-t border-border">
            {tab.points.map((p) => (
              <li key={p} className="border-b border-border py-3 text-sm leading-relaxed">
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">{tab.from}</p>
        </div>
        <div className="min-w-0">
          <Panel />
        </div>
      </div>
    </div>
  );
}
