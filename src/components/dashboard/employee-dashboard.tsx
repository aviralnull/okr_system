// src/components/dashboard/employee-dashboard.tsx
"use client";

import { useState, useTransition } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Target, Star, Bell, User, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, ChevronRight, Building2, Users2,
  Calendar, Briefcase, BellOff, Activity, ArrowUpRight,
  Edit3, MessageSquare, BarChart3, Eye, Lock,
} from "lucide-react";
import type { EmployeeDashboardData } from "@/actions/employee-dashboard.data";
import type { SafeUser }              from "@/lib/auth";

// ── Reused from admin ─────────────────────────────────────────
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

// ── Reusable stat card — same as admin ───────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && (
          <p className={cn("text-xs mt-1 flex items-center gap-1",
            trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
          )}>
            {trend === "up" && <TrendingUp size={10} />}
            {trend === "down" && <AlertTriangle size={10} />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Reusable chart card — same as admin ──────────────────────
function ChartCard({ title, sub, children, className }: {
  title: string; sub?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Premium feature gate ──────────────────────────────────────
function PremiumGate({ feature, plan }: { feature: string; plan: string }) {
  const isLocked = plan === "FREE";
  if (!isLocked) return null;
  return (
    <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 border border-border">
      <Lock size={20} className="text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-foreground">{feature}</p>
      <p className="text-xs text-muted-foreground mt-0.5">Available on Pro plan</p>
      <a href="/settings#billing" className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
        Upgrade →
      </a>
    </div>
  );
}

// ── OKR detail modal ─────────────────────────────────────────
function OKRDetailModal({ obj, onClose }: { obj: any; onClose: () => void }) {
  const [note, setNote] = useState("");
  const [updating, startUpdate] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                {STATUS_LABEL[obj.status]}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${PRIORITY_COLOR[obj.priority]}18`, color: PRIORITY_COLOR[obj.priority] }}>
                {obj.priority}
              </span>
            </div>
            <h2 className="text-base font-semibold text-foreground">{obj.title}</h2>
            {obj.description && <p className="text-xs text-muted-foreground mt-1">{obj.description}</p>}
          </div>
          <button onClick={onClose} className="ml-3 text-muted-foreground hover:text-foreground w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors flex-shrink-0">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Overall progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-foreground">Overall progress</span>
              <span className="font-bold" style={{ color: STATUS_COLOR[obj.status] }}>{Math.round(obj.progress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>{obj.quarter}</span>
              <span>Due {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          {/* Key Results */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Key results ({obj.keyResults.length})
            </p>
            <div className="space-y-3">
              {obj.keyResults.map((kr: any) => (
                <div key={kr.id} className="bg-muted/40 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-sm font-medium text-foreground">{kr.title}</p>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">{kr.currentValue}/{kr.targetValue}</p>
                      <p className="text-[10px] text-muted-foreground">{kr.unit ?? "units"}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden mb-1.5">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${Math.min(kr.progress, 100)}%`,
                        background: kr.progress >= 100 ? "#10b981" : kr.progress >= 60 ? "#6366f1" : "#f59e0b",
                      }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{Math.round(kr.progress)}% complete</span>
                    {kr.progressLogs[0] && (
                      <span>Last updated {new Date(kr.progressLogs[0].createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    )}
                  </div>
                  {/* Recent logs */}
                  {kr.progressLogs.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                      {kr.progressLogs.map((log: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground flex-shrink-0">
                            {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                          <span className="font-medium">{log.value} {kr.unit}</span>
                          {log.note && <span className="text-muted-foreground">— {log.note}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress update */}
          <div className="border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Log progress update</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What progress did you make? Any blockers?"
              rows={3}
              className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
            <div className="flex justify-end mt-2">
              <a href={`/objectives/${obj.id}`}
                className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2">
                Full update <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export function EmployeeDashboard({
  user, data,
}: {
  user: SafeUser;
  data: EmployeeDashboardData;
}) {
  const [tab, setTab] = useState<"overview" | "okrs" | "reviews" | "notifications" | "profile">("overview");
  const [selectedOKR, setSelectedOKR] = useState<any>(null);
  const { summary, charts, myObjectives, myReviews, notifications, profile, recentActivity } = data;
  const plan = user.organization?.subscriptions?.[0]?.plan ?? "FREE";

  const greeting =
    new Date().getHours() < 12  ? "Good morning"
    : new Date().getHours() < 17 ? "Good afternoon"
    : "Good evening";

  const TABS = [
    { id: "overview",      label: "Overview" },
    { id: "okrs",          label: "My OKRs",      badge: summary.totalOKRs },
    { id: "reviews",       label: "Reviews",       badge: summary.totalReviews },
    { id: "notifications", label: "Notifications", badge: summary.unreadCount },
    { id: "profile",       label: "Profile" },
  ] as const;

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {greeting}, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user.organization?.name} &middot;{" "}
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          {summary.unreadCount > 0 && (
            <button onClick={() => setTab("notifications")}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
              <Bell size={13} className="text-red-500" />
              <span>{summary.unreadCount} unread</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap flex-shrink-0",
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              {t.label}
              {"badge" in t && t.badge > 0 && (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  tab === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════ OVERVIEW TAB ══════════ */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="My OKRs"        value={summary.totalOKRs}     icon={Target}       color="#6366f1" sub={`${summary.completed} completed`} />
              <StatCard label="Avg completion" value={`${summary.avgCompletion}%`} icon={TrendingUp} color="#10b981" sub={`${summary.onTrack} on track`} trend={summary.avgCompletion > 60 ? "up" : "down"} />
              <StatCard label="Avg rating"     value={summary.avgRating > 0 ? `${summary.avgRating}/5` : "N/A"} icon={Star} color="#f59e0b" sub={`${summary.totalReviews} reviews`} />
              <StatCard label="Key results"    value={summary.totalKRs}       icon={CheckCircle2} color="#10b981" sub={`${summary.krCompleted} completed`} />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* OKR Status donut */}
              <ChartCard title="OKR status" sub="Current quarter">
                {summary.totalOKRs === 0 ? (
                  <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No OKRs yet</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={charts.okrStatus.filter(s => s.value > 0)}
                          cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                          paddingAngle={3} dataKey="value">
                          {charts.okrStatus.map((s, i) => <Cell key={i} fill={s.color} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1">
                      {charts.okrStatus.map(s => (
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

              {/* Progress trend area */}
              <ChartCard title="Progress trend" sub="Last 6 months" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={charts.monthlyTrend}>
                    <defs>
                      <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(v) => [`${v}%`, "Avg Progress"]} />
                    <Area type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2}
                      fill="url(#empGrad)" dot={{ r: 3, fill: "#6366f1" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* KR completion bar */}
              <ChartCard title="Key result completion" sub="All my key results">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={charts.krCompletion} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" name="Key results" radius={[0, 4, 4, 0]}>
                      {charts.krCompletion.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Recent activity */}
              <ChartCard title="My recent activity">
                {recentActivity.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No activity yet</div>
                ) : (
                  <div className="space-y-2.5">
                    {recentActivity.map(log => (
                      <div key={log.id} className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Activity size={11} className="text-primary" />
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

            {/* Recent OKRs quick view */}
            <ChartCard title="My objectives" sub="Click to view details and update">
              {myObjectives.length === 0 ? (
                <div className="text-center py-8">
                  <Target size={28} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No objectives assigned yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myObjectives.slice(0, 4).map(obj => (
                    <button key={obj.id} onClick={() => setSelectedOKR(obj)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-left">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{obj.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {obj.keyResults.length} key results &middot; {obj.quarter}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-20 hidden md:block">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{Math.round(obj.progress)}%</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                          {STATUS_LABEL[obj.status]}
                        </span>
                        <ChevronRight size={14} className="text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                  {myObjectives.length > 4 && (
                    <button onClick={() => setTab("okrs")}
                      className="w-full text-xs text-primary hover:underline py-2 text-center">
                      View all {myObjectives.length} objectives →
                    </button>
                  )}
                </div>
              )}
            </ChartCard>
          </div>
        )}

        {/* ══════════ OKRS TAB ══════════ */}
        {tab === "okrs" && (
          <div className="space-y-3">
            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {["ALL", "ON_TRACK", "AT_RISK", "BEHIND", "COMPLETED"].map(s => (
                <span key={s} className="text-xs px-3 py-1.5 rounded-full border border-border bg-card cursor-pointer hover:bg-muted transition-colors">
                  {s === "ALL" ? "All" : STATUS_LABEL[s]}
                </span>
              ))}
            </div>

            {myObjectives.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <Target size={36} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No objectives assigned yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your manager will assign OKRs to you</p>
              </div>
            ) : (
              myObjectives.map(obj => (
                <div key={obj.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${STATUS_COLOR[obj.status]}18`, color: STATUS_COLOR[obj.status] }}>
                          {STATUS_LABEL[obj.status]}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${PRIORITY_COLOR[obj.priority]}18`, color: PRIORITY_COLOR[obj.priority] }}>
                          {obj.priority}
                        </span>
                        {obj.team && <span className="text-xs text-muted-foreground">{obj.team.name}</span>}
                        <span className="text-xs text-muted-foreground">{obj.quarter}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{obj.title}</h3>
                      {obj.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{obj.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold" style={{ color: STATUS_COLOR[obj.status] }}>
                        {Math.round(obj.progress)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                    <div className="h-full rounded-full"
                      style={{ width: `${obj.progress}%`, background: STATUS_COLOR[obj.status] }} />
                  </div>

                  {/* Key Results */}
                  {obj.keyResults.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key results</p>
                      {obj.keyResults.map(kr => (
                        <div key={kr.id} className="bg-muted/40 rounded-lg p-3">
                          <div className="flex justify-between mb-1.5">
                            <p className="text-xs font-medium flex-1 truncate">{kr.title}</p>
                            <span className="text-xs font-semibold ml-2">{kr.currentValue}/{kr.targetValue} {kr.unit ?? ""}</span>
                          </div>
                          <div className="h-1.5 bg-background rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{
                                width: `${Math.min(kr.progress, 100)}%`,
                                background: kr.progress >= 100 ? "#10b981" : kr.progress >= 60 ? "#6366f1" : "#f59e0b",
                              }} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">{Math.round(kr.progress)}%</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={11} />
                      <span>Due {new Date(obj.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare size={11} />
                      <span>{obj._count.comments} comments</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity size={11} />
                      <span>{obj._count.progressUpdates} updates</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <button onClick={() => setSelectedOKR(obj)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1">
                        <Eye size={11} /> Details
                      </button>
                      <a href={`/objectives/${obj.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1">
                        <Edit3 size={11} /> Update
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════ REVIEWS TAB ══════════ */}
        {tab === "reviews" && (
          <div className="space-y-3">
            {myReviews.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <Star size={36} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No reviews yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your manager will submit reviews at end of quarter</p>
              </div>
            ) : (
              myReviews.map(review => (
                <div key={review.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold">{review.reviewPeriod}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                          {review.reviewer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-xs text-muted-foreground">{review.reviewer.name}</p>
                        <span className="text-xs text-muted-foreground">·</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < Math.round(review.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />
                      ))}
                      <span className="text-sm font-bold ml-2">{review.rating}/5</span>
                    </div>
                  </div>

                  {review.aiSummary && (
                    <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 mb-3">
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1.5">✨ AI Summary</p>
                      <p className="text-xs leading-relaxed">{review.aiSummary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {review.strengths && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">💪 Strengths</p>
                        <p className="text-xs leading-relaxed">{review.strengths}</p>
                      </div>
                    )}
                    {review.weakness && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1.5">📈 Areas to improve</p>
                        <p className="text-xs leading-relaxed">{review.weakness}</p>
                      </div>
                    )}
                  </div>

                  {review.feedback && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Manager feedback</p>
                      <p className="text-xs leading-relaxed">{review.feedback}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════ NOTIFICATIONS TAB ══════════ */}
        {tab === "notifications" && (
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <BellOff size={36} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No notifications to show</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id}
                  className={cn("flex items-start gap-3 p-4 rounded-xl border transition-colors",
                    n.isRead ? "border-border bg-card" : "border-primary/20 bg-primary/5"
                  )}>
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", n.isRead ? "bg-muted-foreground/30" : "bg-primary")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">New</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════ PROFILE TAB ══════════ */}
        {tab === "profile" && profile && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  {profile.designation && <p className="text-xs text-primary font-medium mt-0.5">{profile.designation}</p>}
                  {profile.employeeId && <p className="text-xs text-muted-foreground">ID: {profile.employeeId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Briefcase,  label: "Role",       value: profile.role.replace("_", " ") },
                  { icon: Calendar,   label: "Joined",     value: new Date(profile.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                  { icon: Building2,  label: "Department", value: profile.department?.name ?? "Not assigned" },
                  { icon: Users2,     label: "Team",       value: profile.team?.name       ?? "Not assigned" },
                  { icon: User,       label: "Manager",    value: profile.manager?.name    ?? "Not assigned" },
                  { icon: Target,     label: "Total OKRs", value: String(profile._count.objectives) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-xs font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            {[
              { href: "/settings",         icon: User,       title: "Edit profile",       sub: "Update name, avatar, password" },
              { href: "/objectives",        icon: Target,     title: "My objectives",      sub: "View and update OKRs" },
              { href: "/notifications",     icon: Bell,       title: "All notifications",  sub: `${summary.unreadCount} unread` },
            ].map(({ href, icon: Icon, title, sub }) => (
              <a key={href} href={href}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* OKR Detail Modal */}
      {selectedOKR && (
        <OKRDetailModal obj={selectedOKR} onClose={() => setSelectedOKR(null)} />
      )}
    </>
  );
}