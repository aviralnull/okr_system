"use client";

import { useRef, useState } from "react";

// Sidebar items below match lib/routes.ts for each role.
const ROLES = [
  {
    id: "employee",
    name: "Employee",
    headline: "Work the goals you own",
    body: "Sees their own objectives and key results. Logs new values, posts progress updates and comments, and gets a notification when something is assigned to them.",
    opens: ["Dashboard", "Objectives", "Reviews", "Settings"],
  },
  {
    id: "manager",
    name: "Manager",
    headline: "Run your team's goals",
    body: "Sees how the team is doing, creates objectives and assigns them to people in their team or department, and approves or rejects OKRs that are sent for approval (Business plan and above).",
    opens: ["Dashboard", "Teams", "Team Overview", "Approvals", "Objectives", "Reviews", "Analytics", "Settings"],
  },
  {
    id: "hr",
    name: "HR",
    headline: "Look after people and reviews",
    body: "Manages employees, teams and departments, runs performance reviews, and reads analytics across the whole organization.",
    opens: ["Dashboard", "Employees", "Teams", "Departments", "Team Overview", "Approvals", "Objectives", "Reviews", "Analytics", "Settings"],
  },
  {
    id: "admin",
    name: "Org admin",
    headline: "Own the organization",
    body: "Invites people with a role already set, organizes departments and teams, chooses the plan and handles billing. Sees everything HR sees.",
    opens: ["Dashboard", "Employees", "Teams", "Departments", "Invitations", "Team Overview", "Approvals", "Objectives", "Reviews", "Analytics", "Settings"],
  },
] as const;

export function RoleTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(to: number) {
    const next = (to + ROLES.length) % ROLES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      move(active + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      move(active - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(ROLES.length - 1);
    }
  }

  const role = ROLES[active];

  return (
    <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-14">
      <div
        role="tablist"
        aria-label="Roles in OKR Desk"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="-mx-5 flex overflow-x-auto border-b border-border px-5 sm:-mx-8 sm:px-8 md:mx-0 md:flex-col md:overflow-visible md:border-b-0 md:border-l md:px-0"
      >
        {ROLES.map((r, i) => {
          const selected = i === active;
          return (
            <button
              key={r.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`role-tab-${r.id}`}
              aria-selected={selected}
              aria-controls={`role-panel-${r.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={
                "-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(252,80%,62%)] md:mb-0 md:-ml-px md:border-b-0 md:border-l-2 " +
                (selected
                  ? "border-[hsl(252,80%,62%)] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground")
              }
            >
              {r.name}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`role-panel-${role.id}`}
        aria-labelledby={`role-tab-${role.id}`}
        tabIndex={0}
        className="min-w-0 focus-visible:outline-none"
      >
        <h3 className="font-[family-name:var(--font-lp-display)] text-2xl font-semibold tracking-tight">
          {role.headline}
        </h3>
        <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-muted-foreground">{role.body}</p>

        <p className="mt-8 text-sm font-medium">In their sidebar</p>
        <ul className="mt-3 grid max-w-xl grid-cols-2 gap-x-8 text-sm sm:grid-cols-3">
          {role.opens.map((item) => (
            <li key={item} className="border-b border-border py-2 text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
