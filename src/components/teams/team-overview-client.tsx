// src/components/team/team-overview-client.tsx
"use client";

import { useState } from "react";
import {
  Users2, Target, ChevronDown, ChevronRight,
  TrendingUp, AlertTriangle, Calendar,
} from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  ON_TRACK: "#10b981", AT_RISK: "#f59e0b",
  BEHIND: "#ef4444", COMPLETED: "#6366f1", NOT_STARTED: "#94a3b8",
};
const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: "On Track", AT_RISK: "At Risk",
  BEHIND: "Behind", COMPLETED: "Completed", NOT_STARTED: "Not Started",
};

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "md" }: { name: string; avatar?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-10 h-10 text-sm";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

type Member = {
  id: string; name: string; avatar: string | null; designation: string | null; role: string;
  objectives: {
    id: string; title: string; progress: number; status: string;
    quarter: string; dueDate: Date; priority: string;
    _count: { keyResults: number };
  }[];
};

export function TeamOverviewClient({
  team,
}: {
  team: { id: string; name: string; users: Member[] } | null;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!team) {
    return (
      <div className="text-center py-16 bg-card border border-border rounded-xl">
        <Users2 size={36} className="text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">No team assigned</p>
        <p className="text-xs text-muted-foreground mt-1">
          You need to be assigned to a team to see team overview
        </p>
      </div>
    );
  }

  const totalOKRs    = team.users.reduce((a, u) => a + u.objectives.length, 0);
  const avgCompletion = totalOKRs > 0
    ? Math.round(team.users.flatMap(u => u.objectives).reduce((a, o) => a + o.progress, 0) / totalOKRs)
    : 0;
  const atRiskCount = team.users.flatMap(u => u.objectives).filter(o => o.status === "AT_RISK" || o.status === "BEHIND").length;

  return (
    <div className="space-y-5">

      {/* Team summary header */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Users2 size={18} className="text-violet-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{team.name}</h2>
            <p className="text-xs text-muted-foreground">{team.users.length} members</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xl font-bold text-foreground">{totalOKRs}</p>
            <p className="text-[10px] text-muted-foreground">Total OKRs</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xl font-bold text-emerald-500">{avgCompletion}%</p>
            <p className="text-[10px] text-muted-foreground">Avg completion</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xl font-bold text-amber-500">{atRiskCount}</p>
            <p className="text-[10px] text-muted-foreground">Need attention</p>
          </div>
        </div>
      </div>

      {/* Per-member breakdown */}
      <div className="space-y-3">
        {team.users.map(member => {
          const isOpen      = expanded.has(member.id);
          const memberAvg   = member.objectives.length > 0
            ? Math.round(member.objectives.reduce((a, o) => a + o.progress, 0) / member.objectives.length)
            : 0;
          const hasAtRisk = member.objectives.some(o => o.status === "AT_RISK" || o.status === "BEHIND");

          return (
            <div key={member.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Member header — clickable */}
              <button onClick={() => toggle(member.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left">
                <Avatar name={member.name} avatar={member.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    {hasAtRisk && <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.designation || member.role.replace("_", " ")} · {member.objectives.length} OKRs
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold" style={{ color: memberAvg >= 70 ? "#10b981" : memberAvg >= 40 ? "#f59e0b" : "#ef4444" }}>
                      {memberAvg}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">avg progress</p>
                  </div>
                  {isOpen ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded — member's OKRs */}
              {isOpen && (
                <div className="border-t border-border p-4 space-y-2 bg-muted/20">
                  {member.objectives.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No objectives assigned</p>
                  ) : (
                    member.objectives.map(obj => (
                      <a key={obj.id} href={`/objectives/${obj.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:shadow-sm transition-shadow">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{obj.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{obj.quarter}</span>
                            <span>·</span>
                            <span>{obj._count.keyResults} KRs</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 hidden md:block">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
                            </div>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0" style={{ color: STATUS_COLOR[obj.status] }}>
                            {Math.round(obj.progress)}%
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                            {STATUS_LABEL[obj.status]}
                          </span>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}