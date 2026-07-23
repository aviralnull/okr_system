"use client";

import { useState } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Users2, Target, TrendingUp, AlertTriangle, Star,
  ChevronRight, Calendar, CheckCircle2, Bell, Plus,
  Building2, Activity,
} from "lucide-react";
import type { ManagerDashboardData } from "@/actions/manager-dashboard.data";
import type { SafeUser }             from "@/lib/auth";

const STATUS_COLOR: Record<string, string> = {
  ON_TRACK: "#10b981", AT_RISK: "#f59e0b",
  BEHIND: "#ef4444", COMPLETED: "#6366f1", NOT_STARTED: "#94a3b8",
};
const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: "On Track", AT_RISK: "At Risk",
  BEHIND: "Behind", COMPLETED: "Completed", NOT_STARTED: "Not Started",
};
const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#6366f1", LOW: "#94a3b8",
};

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Avatar({ name, avatar, size = "md" }: {
  name: string; avatar?: string | null; size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && (
          <p className={cn("text-xs mt-1 flex items-center gap-1",
            trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
          )}>
            {trend === "up"   && <TrendingUp size={10} />}
            {trend === "down" && <AlertTriangle size={10} />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, sub, children, className, action }: {
  title: string; sub?: string; children: React.ReactNode;
  className?: string; action?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

type Tab = "overview" | "team" | "okrs" | "reviews";

export function ManagerDashboard({ user, data }: { user: SafeUser; data: ManagerDashboardData }) {
  const [tab, setTab] = useState<Tab>("overview");
  const { scope, summary, teamOKRs, atRiskOKRs, pendingReviews, recentActivity, memberStats, charts } = data;

  const greeting =
    new Date().getHours() < 12 ? "Good morning"
    : new Date().getHours() < 17 ? "Good afternoon"
    : "Good evening";

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "team",     label: "My Team",  badge: summary.totalMembers },
    { id: "okrs",     label: "OKRs",     badge: summary.totalOKRs },
    { id: "reviews",  label: "Reviews",  badge: summary.pendingReviewsCount },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {greeting}, {user.name.split(" ")[0]} 👋
          </h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-sm text-muted-foreground">{user.organization?.name} · Manager</p>
            {scope.teamName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 flex items-center gap-1">
                <Users2 size={10} /> {scope.teamName}
              </span>
            )}
            {scope.deptName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                <Building2 size={10} /> {scope.deptName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {summary.atRiskCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle size={13} /> {summary.atRiskCount} at risk
            </div>
          )}
          <a href="/objectives/new"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
            <Plus size={13} /> New OKR
          </a>
        </div>
      </div>

      {/* No scope warning */}
      {summary.totalMembers === 0 && (
        <div className="p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            ⚠️ You are not assigned to any team or department yet. Ask your org admin to assign you.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all outline-none whitespace-nowrap",
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                tab === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════ OVERVIEW ══════════ */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard label="Team members"    value={summary.totalMembers}   icon={Users2}        color="#6366f1" sub={scope.teamName ?? scope.deptName ?? "in your scope"} />
            <StatCard label="Team OKRs"       value={summary.totalOKRs}      icon={Target}        color="#10b981" sub={`${summary.completedOKRs} completed`} />
            <StatCard label="Avg completion"  value={`${summary.avgCompletion}%`} icon={TrendingUp} color="#10b981" sub="team average" trend={summary.avgCompletion > 60 ? "up" : "down"} />
            <StatCard label="At risk / behind" value={summary.atRiskCount}   icon={AlertTriangle} color="#ef4444" sub="need attention" trend={summary.atRiskCount > 0 ? "down" : undefined} />
            <StatCard label="Reviews pending"  value={summary.pendingReviewsCount} icon={Star}    color="#f59e0b" sub="this quarter" />
            <StatCard label="Completed OKRs"   value={summary.completedOKRs} icon={CheckCircle2}  color="#6366f1" sub="this period" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="OKR Status" sub="Your team's distribution">
              {summary.totalOKRs === 0 ? (
                <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">No OKRs yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={charts.okrStatusChart.filter(s => s.value > 0)}
                        cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                        {charts.okrStatusChart.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                    {charts.okrStatusChart.filter(s => s.value > 0).map(s => (
                      <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="truncate">{s.name}</span>
                        <span className="ml-auto font-semibold text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>

            <ChartCard title="Team progress trend" sub="Last 6 months" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={charts.monthlyTrend}>
                  <defs>
                    <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, "Avg Progress"]} />
                  <Area type="monotone" dataKey="avgProgress" stroke="#6366f1" strokeWidth={2} fill="url(#mGrad)" dot={{ r: 3, fill: "#6366f1" }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* At risk alert */}
          {atRiskOKRs.length > 0 && (
            <ChartCard title="⚠️ At Risk & Behind" sub="Needs immediate attention"
              action={<a href="/objectives" className="text-xs text-primary hover:underline">View all →</a>}>
              <div className="space-y-2">
                {atRiskOKRs.map(obj => (
                  <a key={obj.id} href={`/objectives/${obj.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{obj.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <Avatar name={obj.owner.name} avatar={obj.owner.avatar} size="sm" />
                        <span>{obj.owner.name}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold" style={{ color: STATUS_COLOR[obj.status] }}>
                        {Math.round(obj.progress)}%
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                        {STATUS_LABEL[obj.status]}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </ChartCard>
          )}

          {/* My recent activity — only manager's own */}
          <ChartCard title="My recent activity" sub="Your actions only">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map(log => (
                  <div key={log.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity size={12} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="text-muted-foreground">{log.action}</span>{" "}
                        <span className="font-medium text-primary">{log.entityType}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {/* ══════════ MY TEAM ══════════ */}
      {tab === "team" && (
        <div className="space-y-4">
          {memberStats.length > 0 && (
            <ChartCard title="Member performance" sub="Avg OKR completion per member">
              <ResponsiveContainer width="100%" height={Math.max(memberStats.length * 44, 180)}>
                <BarChart data={memberStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip formatter={(v) => [`${v}%`, "Avg Progress"]} />
                  <Bar dataKey="avgProgress" radius={[0, 4, 4, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {memberStats.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Users2 size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No team members yet</p>
              <p className="text-xs text-muted-foreground mt-1">Ask your admin to assign members to your team</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memberStats.map(member => {
                const atRisk = member.objectives.filter(o => o.status === "AT_RISK" || o.status === "BEHIND").length;
                const onTrack = member.objectives.filter(o => o.status === "ON_TRACK").length;
                const completed = member.objectives.filter(o => o.status === "COMPLETED").length;
                return (
                  <div key={member.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={member.name} avatar={member.avatar} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.designation || member.role.replace("_", " ")}
                          {member.department && ` · ${member.department.name}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold" style={{ color: member.avgProgress >= 70 ? "#10b981" : member.avgProgress >= 40 ? "#f59e0b" : "#ef4444" }}>
                          {member.avgProgress}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">avg</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full" style={{ width: `${member.avgProgress}%`, background: member.avgProgress >= 70 ? "#10b981" : member.avgProgress >= 40 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[10px]">
                      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">{member.total} OKRs</span>
                      {onTrack > 0    && <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">{onTrack} on track</span>}
                      {atRisk > 0     && <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-600">{atRisk} at risk</span>}
                      {completed > 0  && <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">{completed} done</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════ OKRS ══════════ */}
      {tab === "okrs" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{teamOKRs.length} objectives in your scope</p>
            <a href="/objectives/new" className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Plus size={12} /> New OKR
            </a>
          </div>
          {teamOKRs.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Target size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No objectives yet</p>
              <a href="/objectives/new" className="mt-3 inline-block text-xs px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
                Create first OKR
              </a>
            </div>
          ) : (
            teamOKRs.map(obj => (
              <a key={obj.id} href={`/objectives/${obj.id}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                      {STATUS_LABEL[obj.status]}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${PRIORITY_COLOR[obj.priority]}18`, color: PRIORITY_COLOR[obj.priority] }}>
                      {obj.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">{obj.quarter}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{obj.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Avatar name={obj.owner.name} avatar={obj.owner.avatar} size="sm" />
                    <span>{obj.owner.name}</span>
                    <span>·</span>
                    <span>{obj._count.keyResults} KRs</span>
                    <span>·</span>
                    <span>Due {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-16 hidden md:block">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
                    </div>
                  </div>
                  <p className="text-lg font-bold" style={{ color: STATUS_COLOR[obj.status] }}>{Math.round(obj.progress)}%</p>
                  <ChevronRight size={15} className="text-muted-foreground" />
                </div>
              </a>
            ))
          )}
        </div>
      )}

      {/* ══════════ REVIEWS ══════════ */}
      {tab === "reviews" && (
        <div className="space-y-4">
          {summary.pendingReviewsCount > 0 && (
            <div className="rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-2.5">
              <Bell size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {summary.pendingReviewsCount} team members haven't been reviewed this quarter
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Q{Math.floor(new Date().getMonth() / 3) + 1} {new Date().getFullYear()} reviews pending
                </p>
              </div>
            </div>
          )}

          {pendingReviews.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-medium">All reviews submitted!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingReviews.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                  <Avatar name={member.name} avatar={member.avatar} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.designation ?? "Team member"}</p>
                  </div>
                  <a href="/reviews"
                    className="text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex-shrink-0 flex items-center gap-1.5">
                    <Star size={11} /> Submit review
                  </a>
                </div>
              ))}
            </div>
          )}
          <a href="/reviews" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline py-2">
            View all reviews <ChevronRight size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
