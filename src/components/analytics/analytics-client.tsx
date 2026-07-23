// "use client";

// import { useState, useEffect, useTransition } from "react";
// import {
//   AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
//   RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line,
//   ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
// } from "recharts";
// import {
//   Target, TrendingUp, CheckCircle2, AlertTriangle, Star,
//   BarChart3, Users2, Award, Filter, X, Building2, User,
// } from "lucide-react";
// import { getAnalyticsData } from "@/actions/analytics.actions";
// import type { AnalyticsData, AnalyticsFilterData } from "@/actions/analytics.actions";

// function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// function StatCard({ label, value, sub, icon: Icon, color, trend }: {
//   label: string; value: string | number; sub?: string;
//   icon: React.ElementType; color: string; trend?: "up" | "down";
// }) {
//   return (
//     <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
//       <div className="flex items-center justify-between">
//         <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{label}</p>
//         <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
//           <Icon size={15} style={{ color }} />
//         </div>
//       </div>
//       <div>
//         <p className="text-2xl font-bold text-foreground">{value}</p>
//         {sub && (
//           <p className={cn("text-xs mt-1 flex items-center gap-1",
//             trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
//           )}>
//             {trend === "up"   && <TrendingUp size={10} />}
//             {trend === "down" && <AlertTriangle size={10} />}
//             {sub}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// function ChartCard({ title, sub, children, className }: {
//   title: string; sub?: string; children: React.ReactNode; className?: string;
// }) {
//   return (
//     <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
//       <div className="mb-4">
//         <p className="text-sm font-semibold text-foreground">{title}</p>
//         {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
//       </div>
//       {children}
//     </div>
//   );
// }

// function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
//   if (avatar) return <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
//   return (
//     <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
//       {name.slice(0, 2).toUpperCase()}
//     </div>
//   );
// }

// export function AnalyticsClient({
//   initialData, filterData, orgId, userId, role,
// }: {
//   initialData: AnalyticsData;
//   filterData?: AnalyticsFilterData;
//   orgId:       string;
//   userId:      string;
//   role:        string;
// }) {
//   const [data, setData]           = useState(initialData);
//   const [activeTab, setActiveTab] = useState<"overview" | "okrs" | "team">("overview");
//   const [teamFilter, setTeamF]    = useState("ALL");
//   const [deptFilter, setDeptF]    = useState("ALL");
//   const [memberFilter, setMemberF] = useState("ALL");
//   const [pending, startTransition] = useTransition();

//   const { summary, charts, recentCompleted, isManagerPlus } = data;

//   // Re-fetch on filter change
//   useEffect(() => {
//     if (!filterData) return;
//     if (teamFilter === "ALL" && deptFilter === "ALL" && memberFilter === "ALL") {
//       setData(initialData);
//       return;
//     }
//     startTransition(async () => {
//       const newData = await getAnalyticsData(orgId, userId, role, {
//         teamId:       teamFilter   !== "ALL" ? teamFilter   : undefined,
//         departmentId: deptFilter   !== "ALL" ? deptFilter   : undefined,
//         memberId:     memberFilter !== "ALL" ? memberFilter : undefined,
//       });
//       setData(newData);
//     });
//   }, [teamFilter, deptFilter, memberFilter]);

//   const hasFilters = teamFilter !== "ALL" || deptFilter !== "ALL" || memberFilter !== "ALL";

//   function clearFilters() {
//     setTeamF("ALL"); setDeptF("ALL"); setMemberF("ALL");
//   }

//   const TABS = [
//     { id: "overview", label: "Overview" },
//     { id: "okrs",     label: "OKRs" },
//     ...(isManagerPlus ? [{ id: "team", label: "Team" }] : []),
//   ] as const;

//   return (
//     <div className="space-y-6">

//       {/* Filters — manager+ only */}
//       {isManagerPlus && filterData && (
//         <div className="flex items-center gap-2 flex-wrap p-3 bg-card border border-border rounded-xl">
//           <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mr-1">
//             <Filter size={12} /> Filter by:
//           </span>

//           <select value={teamFilter} onChange={e => { setTeamF(e.target.value); setDeptF("ALL"); setMemberF("ALL"); }}
//             className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none cursor-pointer">
//             <option value="ALL">All Teams</option>
//             {filterData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//           </select>

//           <select value={deptFilter} onChange={e => { setDeptF(e.target.value); setTeamF("ALL"); setMemberF("ALL"); }}
//             className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none cursor-pointer">
//             <option value="ALL">All Departments</option>
//             {filterData.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//           </select>

//           <select value={memberFilter} onChange={e => { setMemberF(e.target.value); setTeamF("ALL"); setDeptF("ALL"); }}
//             className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none cursor-pointer">
//             <option value="ALL">All Employees</option>
//             {filterData.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//           </select>

//           {hasFilters && (
//             <button onClick={clearFilters}
//               className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
//               <X size={11} /> Clear
//             </button>
//           )}

//           {pending && <span className="text-xs text-muted-foreground animate-pulse ml-auto">Updating...</span>}
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="flex gap-0 border-b border-border">
//         {TABS.map(t => (
//           <button key={t.id} onClick={() => setActiveTab(t.id as any)}
//             className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all outline-none",
//               activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
//             )}>
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {/* OVERVIEW */}
//       {activeTab === "overview" && (
//         <div className="space-y-5">
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//             <StatCard label="Total OKRs"     value={summary.totalOKRs}     icon={Target}       color="#6366f1" sub={`${summary.completed} completed`} />
//             <StatCard label="Avg Completion" value={`${summary.avgCompletion}%`} icon={TrendingUp} color="#10b981" sub="across all OKRs" trend={summary.avgCompletion > 60 ? "up" : "down"} />
//             <StatCard label="At Risk"        value={summary.atRisk}        icon={AlertTriangle} color="#ef4444" sub="need attention" trend={summary.atRisk > 0 ? "down" : undefined} />
//             <StatCard label="Avg Rating"     value={summary.avgRating > 0 ? `${summary.avgRating}/5` : "N/A"} icon={Star} color="#f59e0b" sub={`${summary.totalReviews} reviews`} />
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//             <StatCard label="On Track"    value={summary.onTrack}    icon={CheckCircle2}  color="#10b981" />
//             <StatCard label="Behind"      value={summary.behind}     icon={AlertTriangle} color="#ef4444" />
//             <StatCard label="Key Results" value={summary.totalKRs}   icon={BarChart3}     color="#6366f1" sub={`${summary.avgKRProgress}% avg`} />
//             <StatCard label="Not Started" value={summary.notStarted} icon={Target}        color="#94a3b8" />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <ChartCard title="OKR Status" sub="Current distribution">
//               {summary.totalOKRs === 0 ? (
//                 <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">No data yet</div>
//               ) : (
//                 <>
//                   <ResponsiveContainer width="100%" height={160}>
//                     <PieChart>
//                       <Pie data={charts.okrStatus.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
//                         {charts.okrStatus.map((s, i) => <Cell key={i} fill={s.color} />)}
//                       </Pie>
//                       <Tooltip formatter={(v, n) => [v, n]} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                   <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
//                     {charts.okrStatus.map(s => (
//                       <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
//                         <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
//                         <span className="truncate">{s.name}</span>
//                         <span className="ml-auto font-semibold text-foreground">{s.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </ChartCard>

//             <ChartCard title="Progress Trend" sub="Last 6 months" className="lg:col-span-2">
//               <ResponsiveContainer width="100%" height={210}>
//                 <AreaChart data={charts.monthlyTrend}>
//                   <defs>
//                     <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
//                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
//                   <Tooltip />
//                   <Legend wrapperStyle={{ fontSize: 11 }} />
//                   <Area type="monotone" dataKey="avgProgress" name="Avg Progress" stroke="#6366f1" strokeWidth={2} fill="url(#aGrad)" />
//                   <Bar dataKey="total" name="OKRs Created" fill="#10b981" opacity={0.6} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <ChartCard title="Update Activity" sub="Progress logs per month">
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={charts.activityByMonth}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="updates" name="Updates" fill="#10b981" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartCard>

//             <ChartCard title="Priority Breakdown">
//               <ResponsiveContainer width="100%" height={200}>
//                 <RadarChart data={charts.okrPriority}>
//                   <PolarGrid stroke="hsl(var(--border))" />
//                   <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
//                   <Radar name="OKRs" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
//                   <Tooltip />
//                 </RadarChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>

//           {recentCompleted.length > 0 && (
//             <ChartCard title="Recently Completed">
//               <div className="space-y-2">
//                 {recentCompleted.map(obj => (
//                   <a key={obj.id} href={`/objectives/${obj.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
//                     <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
//                       <CheckCircle2 size={14} className="text-emerald-500" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-foreground truncate">{obj.title}</p>
//                       <p className="text-xs text-muted-foreground">{obj.owner.name} · {obj.quarter}</p>
//                     </div>
//                     <span className="text-xs font-bold text-emerald-500 flex-shrink-0">100%</span>
//                   </a>
//                 ))}
//               </div>
//             </ChartCard>
//           )}
//         </div>
//       )}

//       {/* OKRS */}
//       {activeTab === "okrs" && (
//         <div className="space-y-5">
//           <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
//             {charts.okrStatus.map(s => (
//               <div key={s.name} className="rounded-xl border border-border bg-card p-4">
//                 <p className="text-xs text-muted-foreground mb-2">{s.name}</p>
//                 <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
//               </div>
//             ))}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <ChartCard title="Monthly Trend">
//               <ResponsiveContainer width="100%" height={220}>
//                 <LineChart data={charts.monthlyTrend}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" tick={{ fontSize: 11 }} />
//                   <YAxis yAxisId="l" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
//                   <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
//                   <Tooltip />
//                   <Legend wrapperStyle={{ fontSize: 11 }} />
//                   <Line yAxisId="l" type="monotone" dataKey="avgProgress" name="Avg %" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
//                   <Line yAxisId="r" type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </ChartCard>

//             <ChartCard title="Priority Distribution">
//               <ResponsiveContainer width="100%" height={220}>
//                 <BarChart data={charts.okrPriority}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="name" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="value" name="OKRs" radius={[4, 4, 0, 0]}>
//                     {charts.okrPriority.map((p, i) => <Cell key={i} fill={p.color} />)}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>
//         </div>
//       )}

//       {/* TEAM */}
//       {activeTab === "team" && isManagerPlus && (
//         <div className="space-y-5">
//           {charts.deptPerformance.length > 0 ? (
//             <ChartCard title="Department Performance">
//               <ResponsiveContainer width="100%" height={260}>
//                 <BarChart data={charts.deptPerformance}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="name" tick={{ fontSize: 11 }} />
//                   <YAxis yAxisId="l" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
//                   <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
//                   <Tooltip />
//                   <Legend wrapperStyle={{ fontSize: 11 }} />
//                   <Bar yAxisId="l" dataKey="avgProgress" name="Avg %" fill="#6366f1" radius={[4,4,0,0]} />
//                   <Bar yAxisId="r" dataKey="memberCount" name="Members" fill="#10b981" radius={[4,4,0,0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           ) : (
//             <div className="text-center py-10 bg-card border border-border rounded-xl">
//               <Building2 size={28} className="text-muted-foreground mx-auto mb-2" />
//               <p className="text-sm text-muted-foreground">Select "All Teams/Departments" to see department comparison</p>
//             </div>
//           )}

//           {charts.topPerformers.length > 0 && (
//             <ChartCard title="Top Performers" sub="Ranked by avg OKR completion">
//               <div className="space-y-2">
//                 {charts.topPerformers.map((p, i) => (
//                   <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
//                     <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
//                       i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
//                     )}>
//                       {i < 3 ? <Award size={12} /> : i + 1}
//                     </div>
//                     <Avatar name={p.name} avatar={p.avatar} />
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-foreground">{p.name}</p>
//                       <p className="text-xs text-muted-foreground">{p.total} OKRs · {p.completed} completed</p>
//                     </div>
//                     <div className="w-20 hidden md:block">
//                       <div className="h-1.5 bg-muted rounded-full overflow-hidden">
//                         <div className="h-full rounded-full bg-primary" style={{ width: `${p.avgProgress}%` }} />
//                       </div>
//                     </div>
//                     <span className="text-sm font-bold text-primary flex-shrink-0">{p.avgProgress}%</span>
//                   </div>
//                 ))}
//               </div>
//             </ChartCard>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useTransition } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  Target, TrendingUp, CheckCircle2, AlertTriangle, Star,
  BarChart3, Users2, Award, Filter, X, Download,
} from "lucide-react";
import { getAnalyticsData } from "@/actions/analytics.actions";
import { PremiumGate, LockedBanner } from "@/components/shared/primium-gate";
import { canUseFeature, type Plan }  from "@/lib/plan-config";
import type { AnalyticsData, AnalyticsFilterData } from "@/actions/analytics.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
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
            {trend === "up" && <TrendingUp size={10} />}
            {trend === "down" && <AlertTriangle size={10} />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, sub, children, className, action }: {
  title: string; sub?: string; children: React.ReactNode; className?: string; action?: React.ReactNode;
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

function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
  if (avatar) return <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function AnalyticsClient({
  initialData, filterData, orgId, userId, role, plan,
}: {
  initialData: AnalyticsData;
  filterData?: AnalyticsFilterData;
  orgId:       string;
  userId:      string;
  role:        string;
  plan:        Plan;
}) {
  const [data, setData]            = useState(initialData);
  const [activeTab, setActiveTab]  = useState<"overview" | "okrs" | "team">("overview");
  const [teamFilter, setTeamF]     = useState("ALL");
  const [deptFilter, setDeptF]     = useState("ALL");
  const [memberFilter, setMemberF] = useState("ALL");
  const [pending, startTransition] = useTransition();
  const { summary, charts, recentCompleted, isManagerPlus } = data;

  // Feature flags
  const canFilterTeam     = canUseFeature(plan, "analyticsTeamFilter");
  const canFilterDept     = canUseFeature(plan, "analyticsDeptFilter");
  const canFilterEmployee = canUseFeature(plan, "analyticsEmployeeFilter");
  const canExport         = canUseFeature(plan, "analyticsExport");

  const hasFilters = teamFilter !== "ALL" || deptFilter !== "ALL" || memberFilter !== "ALL";

  useEffect(() => {
    if (!filterData) return;
    if (!hasFilters) { setData(initialData); return; }

    startTransition(async () => {
      const newData = await getAnalyticsData(orgId, userId, role, {
        teamId:       teamFilter   !== "ALL" ? teamFilter   : undefined,
        departmentId: deptFilter   !== "ALL" ? deptFilter   : undefined,
        memberId:     memberFilter !== "ALL" ? memberFilter : undefined,
      });
      setData(newData);
    });
  }, [teamFilter, deptFilter, memberFilter]);

  function clearFilters() { setTeamF("ALL"); setDeptF("ALL"); setMemberF("ALL"); }

  function handleExport() {
    const rows = [
      ["OKR Status", "Count"],
      ...charts.okrStatus.map(s => [s.name, s.value]),
      [],
      ["Month", "Avg Progress", "Total OKRs"],
      ...charts.monthlyTrend.map(m => [m.month, m.avgProgress, m.total]),
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "analytics.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "okrs",     label: "OKRs" },
    ...(isManagerPlus ? [{ id: "team", label: "Team" }] : []),
  ] as const;

  return (
    <div className="space-y-6">

      {/* Filter bar — gated */}
      {isManagerPlus && filterData && (
        <div className="flex items-center gap-2 flex-wrap p-3 bg-card border border-border rounded-xl">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mr-1">
            <Filter size={12} /> Filter by:
          </span>

          {/* Team filter */}
          {canFilterTeam ? (
            <select value={teamFilter} onChange={e => { setTeamF(e.target.value); setDeptF("ALL"); setMemberF("ALL"); }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none cursor-pointer">
              <option value="ALL">All Teams</option>
              {filterData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-border text-muted-foreground cursor-not-allowed opacity-60">
              All Teams 🔒
            </div>
          )}

          {/* Dept filter */}
          {canFilterDept ? (
            <select value={deptFilter} onChange={e => { setDeptF(e.target.value); setTeamF("ALL"); setMemberF("ALL"); }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none cursor-pointer">
              <option value="ALL">All Departments</option>
              {filterData.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-border text-muted-foreground cursor-not-allowed opacity-60">
              All Departments 🔒
            </div>
          )}

          {/* Employee filter — BUSINESS+ only */}
          {canFilterEmployee ? (
            <select value={memberFilter} onChange={e => { setMemberF(e.target.value); setTeamF("ALL"); setDeptF("ALL"); }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none cursor-pointer">
              <option value="ALL">All Employees</option>
              {filterData.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-amber-400/50 bg-amber-50 dark:bg-amber-950/20 text-amber-600 cursor-not-allowed"
              title="Upgrade to Business to filter by individual employee">
              Employee filter 👑 Business
            </div>
          )}

          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          )}

          {/* Export — PRO+ */}
          {canExport ? (
            <button onClick={handleExport}
              className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <Download size={12} /> Export CSV
            </button>
          ) : (
            <div className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-border text-muted-foreground opacity-60 cursor-not-allowed">
              <Download size={12} /> Export CSV 🔒
            </div>
          )}

          {pending && <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>}
        </div>
      )}

      {/* FREE plan banner */}
      {plan === "FREE" && isManagerPlus && (
        <LockedBanner
          requiredPlan="PRO"
          label="Unlock advanced analytics filters"
          description="Filter by team, department, and individual employees with Pro plan"
        />
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all outline-none",
              activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total OKRs"     value={summary.totalOKRs}     icon={Target}        color="#6366f1" sub={`${summary.completed} completed`} />
            <StatCard label="Avg Completion" value={`${summary.avgCompletion}%`} icon={TrendingUp} color="#10b981" sub="across all OKRs" trend={summary.avgCompletion > 60 ? "up" : "down"} />
            <StatCard label="At Risk"        value={summary.atRisk}        icon={AlertTriangle} color="#ef4444" sub="need attention" trend={summary.atRisk > 0 ? "down" : undefined} />
            <StatCard label="Avg Rating"     value={summary.avgRating > 0 ? `${summary.avgRating}/5` : "N/A"} icon={Star} color="#f59e0b" sub={`${summary.totalReviews} reviews`} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="On Track"    value={summary.onTrack}    icon={CheckCircle2}  color="#10b981" />
            <StatCard label="Behind"      value={summary.behind}     icon={AlertTriangle} color="#ef4444" />
            <StatCard label="Key Results" value={summary.totalKRs}   icon={BarChart3}     color="#6366f1" sub={`${summary.avgKRProgress}% avg`} />
            <StatCard label="Not Started" value={summary.notStarted} icon={Target}        color="#94a3b8" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="OKR Status" sub="Current distribution">
              {summary.totalOKRs === 0 ? (
                <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">No data yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={charts.okrStatus.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                        {charts.okrStatus.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
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

            <ChartCard title="Progress Trend" sub="Last 6 months" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={charts.monthlyTrend}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgProgress" name="Avg Progress" stroke="#6366f1" strokeWidth={2} fill="url(#aGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Update Activity" sub="Progress logs per month">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts.activityByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="updates" name="Updates" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Priority Breakdown">
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={charts.okrPriority}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <Radar name="OKRs" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {recentCompleted.length > 0 && (
            <ChartCard title="Recently Completed">
              <div className="space-y-2">
                {recentCompleted.map(obj => (
                  <a key={obj.id} href={`/objectives/${obj.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{obj.title}</p>
                      <p className="text-xs text-muted-foreground">{obj.owner.name} · {obj.quarter}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 flex-shrink-0">100%</span>
                  </a>
                ))}
              </div>
            </ChartCard>
          )}
        </div>
      )}

      {/* OKRS tab */}
      {activeTab === "okrs" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {charts.okrStatus.map(s => (
              <div key={s.name} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-2">{s.name}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Monthly Trend">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={charts.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="l" type="monotone" dataKey="avgProgress" name="Avg %" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="r" type="monotone" dataKey="completed"   name="Completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Priority Distribution">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts.okrPriority}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="OKRs" radius={[4,4,0,0]}>
                    {charts.okrPriority.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* TEAM tab — with individual employee analytics gate */}
      {activeTab === "team" && isManagerPlus && (
        <div className="space-y-5">
          {charts.deptPerformance.length > 0 ? (
            <ChartCard title="Department Performance">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts.deptPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="l" dataKey="avgProgress" name="Avg %" fill="#6366f1" radius={[4,4,0,0]} />
                  <Bar yAxisId="r" dataKey="memberCount" name="Members" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <div className="text-center py-8 bg-card border border-border rounded-xl text-sm text-muted-foreground">
              Select "All" filters to see department comparison
            </div>
          )}

          {/* Individual employee analytics — BUSINESS+ */}
          <PremiumGate
            feature="analyticsEmployeeFilter"
            currentPlan={plan}
            requiredPlan="BUSINESS"
            mode="replace"
            label="Individual employee analytics"
            description="See detailed per-employee performance breakdown, OKR trends, and ratings"
          >
            {charts.topPerformers.length > 0 && (
              <ChartCard title="Top Performers" sub="Ranked by avg OKR completion">
                <div className="space-y-2">
                  {charts.topPerformers.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {i < 3 ? <Award size={12} /> : i + 1}
                      </div>
                      <Avatar name={p.name} avatar={p.avatar} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.total} OKRs · {p.completed} completed</p>
                      </div>
                      <div className="w-20 hidden md:block">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${p.avgProgress}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary flex-shrink-0">{p.avgProgress}%</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
          </PremiumGate>
        </div>
      )}
    </div>
  );
}
