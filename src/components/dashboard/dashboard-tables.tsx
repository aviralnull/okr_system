// components/dashboard/dashboard-tables.tsx
"use client";

import { Activity } from "lucide-react";
import type { DashboardTables as DashboardTablesType } from "@/actions/org-admin.data";

const STATUS_COLOR: Record<string, string> = {
  ON_TRACK:    "#10b981",
  AT_RISK:     "#f59e0b",
  BEHIND:      "#ef4444",
  COMPLETED:   "#6366f1",
  NOT_STARTED: "#94a3b8",
};

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK:    "On Track",
  AT_RISK:     "At Risk",
  BEHIND:      "Behind",
  COMPLETED:   "Completed",
  NOT_STARTED: "Not Started",
};

export function DashboardTables({ data }: { data: DashboardTablesType }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* ── Recent Objectives ─────────────────────────── */}
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Recent Objectives</p>
            <p className="text-xs text-muted-foreground mt-0.5">Latest OKRs across the org</p>
          </div>
          <a href="/objectives" className="text-xs text-primary hover:underline">
            View all →
          </a>
        </div>

        {data.recentObjectives.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No objectives yet</p>
            <a
              href="/objectives"
              className="text-xs text-primary hover:underline mt-1 block"
            >
              Create your first OKR →
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentObjectives.map((obj) => (
              <a
                key={obj.id}
                href={`/objectives/${obj.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{obj.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span>{obj.owner.name}</span>
                    {obj.team && (
                      <>
                        <span>·</span>
                        <span>{obj.team.name}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{obj._count.keyResults} key results</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Progress bar */}
                  <div className="w-20 hidden md:block">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{Math.round(obj.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width:      `${obj.progress}%`,
                          background: STATUS_COLOR[obj.status] ?? "#94a3b8",
                        }}
                      />
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                    style={{
                      background: `${STATUS_COLOR[obj.status] ?? "#94a3b8"}18`,
                      color:       STATUS_COLOR[obj.status] ?? "#94a3b8",
                    }}
                  >
                    {STATUS_LABEL[obj.status] ?? obj.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Activity Feed ─────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">Recent Activity</p>
          <Activity size={14} className="text-muted-foreground" />
        </div>

        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity yet
          </p>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                  {log.user?.name?.slice(0, 2).toUpperCase() ?? "??"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">
                    <span className="font-medium">
                      {log.user?.name ?? "System"}
                    </span>{" "}
                    <span className="text-muted-foreground">{log.action}</span>{" "}
                    <span className="text-primary font-medium">
                      {log.entityType}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      day:    "numeric",
                      month:  "short",
                      hour:   "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}