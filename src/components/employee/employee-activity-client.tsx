// src/components/employees/employee-activity-client.tsx
"use client";

import { useState } from "react";
import {
  Target, TrendingUp, Star, Activity, CheckCircle2,
  AlertTriangle, Clock, Bell, ChevronRight, Calendar,
  BarChart3, MessageSquare, User, Building2, Users2,
} from "lucide-react";
import type { EmployeeActivityData } from "@/actions/employee-activity.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "md" }: {
  name: string; avatar?: string | null; size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-14 h-14 text-lg" : "w-9 h-9 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  ON_TRACK: "#10b981", AT_RISK: "#f59e0b",
  BEHIND: "#ef4444", COMPLETED: "#6366f1", NOT_STARTED: "#94a3b8",
};
const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: "On Track", AT_RISK: "At Risk",
  BEHIND: "Behind", COMPLETED: "Completed", NOT_STARTED: "Not Started",
};

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hrs  < 24)  return `${hrs}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

type Tab = "overview" | "okrs" | "activity" | "reviews";

export function EmployeeActivityClient({ data }: { data: EmployeeActivityData }) {
  const [tab, setTab] = useState<Tab>("overview");
  const { employee, stats, objectives, keyResultLogs, reviews, activityLogs } = data;

  if (!employee) return null;

const allTeams = employee.team?.name
  ? [employee.team.name]
  : [];

  // const allDepts = [
  //   employee.department?.name,
  //   ...(employee.userDepartments?.map(ud => ud.department.name) ?? []),
  // ].filter(Boolean);
  const allDepts = employee.department
  ? [employee.department.name]
  : [];

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",  label: "Overview" },
    { id: "okrs",      label: `OKRs (${objectives.length})` },
    { id: "activity",  label: `Activity (${activityLogs.length})` },
    { id: "reviews",   label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Employee header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar name={employee.name} avatar={employee.avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-foreground">{employee.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {employee.designation || employee.role.replace("_", " ")}
                </p>
              </div>
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0",
                employee.isActive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              )}>
                {employee.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-muted-foreground">
              {allTeams.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users2 size={11} />
                  {allTeams.join(", ")}
                </span>
              )}
              {allDepts.length > 0 && (
                <span className="flex items-center gap-1">
                  <Building2 size={11} />
                  {allDepts.join(", ")}
                </span>
              )}
              {employee.manager && (
                <span className="flex items-center gap-1.5">
                  <Avatar name={employee.manager.name} avatar={employee.manager.avatar} size="sm" />
                  Reports to {employee.manager.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                Joined {new Date(employee.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{stats.avgCompletion}%</p>
            <p className="text-[10px] text-muted-foreground">Avg completion</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-500">{stats.completedOKRs}</p>
            <p className="text-[10px] text-muted-foreground">OKRs done</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: stats.avgRating >= 4 ? "#10b981" : stats.avgRating >= 3 ? "#f59e0b" : "#ef4444" }}>
              {stats.avgRating > 0 ? `${stats.avgRating}/5` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Avg rating</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{stats.weeklyActivity}</p>
            <p className="text-[10px] text-muted-foreground">Actions this week</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all outline-none whitespace-nowrap",
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total OKRs"      value={stats.totalOKRs}     icon={Target}        color="#6366f1" />
            <StatCard label="Completed"        value={stats.completedOKRs} icon={CheckCircle2}  color="#10b981" />
            <StatCard label="At risk / behind" value={stats.atRiskOKRs}   icon={AlertTriangle} color="#ef4444" />
            <StatCard label="Reviews"          value={stats.totalReviews}  icon={Star}          color="#f59e0b" sub={stats.avgRating > 0 ? `${stats.avgRating}/5 avg` : undefined} />
          </div>

          {/* Last active */}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Last active</p>
              <p className="text-xs text-muted-foreground">
                {stats.lastActive ? timeAgo(stats.lastActive) : "No activity recorded"}
              </p>
            </div>
            {stats.unreadNotifications > 0 && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 px-2.5 py-1.5 rounded-full">
                <Bell size={11} />
                {stats.unreadNotifications} unread notifications
              </div>
            )}
          </div>

          {/* Recent KR updates */}
          {keyResultLogs.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Recent progress updates</p>
              <div className="space-y-2">
                {keyResultLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {log.keyResult.objective.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        KR: {log.keyResult.title} → {log.value}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── OKRS ── */}
      {tab === "okrs" && (
        <div className="space-y-3">
          {objectives.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Target size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No objectives assigned</p>
            </div>
          ) : objectives.map(obj => (
            <a key={obj.id} href={`/objectives/${obj.id}`}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                    {STATUS_LABEL[obj.status]}
                  </span>
                  <span className="text-xs text-muted-foreground">{obj.quarter}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{obj.title}</p>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{obj.keyResults.length} KRs</span>
                  <span>{obj.comments.length} comments</span>
                  <span>Due {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold" style={{ color: STATUS_COLOR[obj.status] }}>
                  {Math.round(obj.progress)}%
                </p>
                <ChevronRight size={14} className="text-muted-foreground ml-auto mt-1" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* ── ACTIVITY ── */}
      {tab === "activity" && (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">All activity</p>
          {activityLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity recorded</p>
          ) : (
            <div className="space-y-3">
              {activityLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity size={12} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">
                      <span className="font-medium">{log.action}</span>{" "}
                      <span className="text-muted-foreground">{log.entityType}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REVIEWS ── */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Star size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            </div>
          ) : reviews.map(r => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={r.reviewer.name} avatar={r.reviewer.avatar} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{r.reviewer.name}</p>
                  <p className="text-xs text-muted-foreground">{r.reviewPeriod}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />
                  ))}
                  <span className="text-xs font-bold ml-1">{r.rating}/5</span>
                </div>
              </div>
              {r.aiSummary && (
                <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg mb-2">
                  <p className="text-xs text-foreground leading-relaxed">{r.aiSummary}</p>
                </div>
              )}
              {r.strengths && <p className="text-xs text-muted-foreground"><strong className="text-emerald-600">Strengths:</strong> {r.strengths}</p>}
              {r.weakness  && <p className="text-xs text-muted-foreground mt-1"><strong className="text-amber-600">Growth areas:</strong> {r.weakness}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}