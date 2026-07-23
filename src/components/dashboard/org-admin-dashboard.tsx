// // components/dashboard/org-admin-dashboard.tsx
// "use client";

// import { useState } from "react";
// import {
//   AreaChart, Area,
//   BarChart, Bar,
//   LineChart, Line,
//   PieChart, Pie, Cell,
//   RadarChart, Radar, PolarGrid, PolarAngleAxis,
//   ResponsiveContainer,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend,
// } from "recharts";
// import {
//   Users, Target, Building2, UserPlus, TrendingUp,
//   AlertTriangle, CheckCircle2, Clock, Star, Bell,
//   CreditCard, Activity, BarChart3, ArrowUpRight, Briefcase,
// } from "lucide-react";
// import type { OrgAdminDashboardData } from "@/actions/org-admin.data";
// import type { SafeUser }              from "@/lib/auth";

// // ── helpers ──────────────────────────────────────────────────
// const STATUS_COLOR: Record<string, string> = {
//   ON_TRACK: "#10b981", AT_RISK: "#f59e0b",
//   BEHIND: "#ef4444", COMPLETED: "#6366f1", NOT_STARTED: "#94a3b8",
// };
// const STATUS_LABEL: Record<string, string> = {
//   ON_TRACK: "On Track", AT_RISK: "At Risk",
//   BEHIND: "Behind", COMPLETED: "Completed", NOT_STARTED: "Not Started",
// };
// function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// // ── Stat Card ─────────────────────────────────────────────────
// function StatCard({
//   label, value, sub, icon: Icon, color, trend,
// }: {
//   label: string; value: string | number; sub?: string;
//   icon: React.ElementType; color: string; trend?: "up" | "down";
// }) {
//   return (
//     <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
//       <div className="flex items-center justify-between">
//         <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
//         <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
//           <Icon size={15} style={{ color }} />
//         </div>
//       </div>
//       <div>
//         <p className="text-2xl font-bold text-foreground">{value}</p>
//         {sub && (
//           <p className={cn("text-xs mt-1 flex items-center gap-1",
//             trend === "up"   ? "text-emerald-500"
//             : trend === "down" ? "text-red-500"
//             : "text-muted-foreground"
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

// // ── Chart wrapper ─────────────────────────────────────────────
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

// // ── Section header ─────────────────────────────────────────────
// function SectionTitle({ children }: { children: React.ReactNode }) {
//   return (
//     <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
//       {children}
//     </h2>
//   );
// }

// // ── MAIN ──────────────────────────────────────────────────────
// export function OrgAdminDashboard({
//   user, data,
// }: {
//   user: SafeUser;
//   data: OrgAdminDashboardData;
// }) {
//   const { summary, charts, recentObjectives, recentMembers, recentActivity } = data;
//   const [tab, setTab] = useState<"overview" | "people" | "okrs" | "activity">("overview");

//   const greeting =
//     new Date().getHours() < 12 ? "Good morning"
//     : new Date().getHours() < 17 ? "Good afternoon"
//     : "Good evening";

//   const TABS = ["overview", "people", "okrs", "activity"] as const;

//   return (
//     <div className="space-y-6">

//       {/* ── Header ───────────────────────────────────────── */}
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-xl font-bold text-foreground">
//             {greeting}, {user.name.split(" ")[0]} 👋
//           </h1>
//           <p className="text-sm text-muted-foreground mt-0.5">
//             {user.organization?.name} &middot;{" "}
//             {new Date().toLocaleDateString("en-IN", {
//               weekday: "long", day: "numeric", month: "long",
//             })}
//           </p>
//         </div>

//         {/* Quick actions */}
//         <div className="flex items-center gap-2 flex-wrap">
//           <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium">
//             <Building2 size={13} /> New Department
//           </button>
//           <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium">
//             <Users size={13} /> New Team
//           </button>
//           <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
//             <UserPlus size={13} /> Invite Member
//           </button>
//           {summary.unreadNotifications > 0 && (
//             <div className="relative">
//               <button className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
//                 <Bell size={15} />
//               </button>
//               <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
//                 {summary.unreadNotifications > 9 ? "9+" : summary.unreadNotifications}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Tabs ─────────────────────────────────────────── */}
//       <div className="flex gap-0 border-b border-border">
//         {TABS.map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className={cn(
//               "px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-all",
//               tab === t
//                 ? "border-primary text-primary"
//                 : "border-transparent text-muted-foreground hover:text-foreground"
//             )}
//           >
//             {t}
//           </button>
//         ))}
//       </div>

//       {/* ══════════════════════════════════════════════════
//           OVERVIEW TAB
//       ══════════════════════════════════════════════════ */}
//       {tab === "overview" && (
//         <div className="space-y-6">

//           {/* Stat cards row 1 */}
//           <div>
//             <SectionTitle>Organization</SectionTitle>
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//               <StatCard label="Total Employees"  value={summary.totalEmployees}   icon={Users}        color="#6366f1" sub={`${summary.activeEmployees} active`} trend="up" />
//               <StatCard label="Teams"            value={summary.totalTeams}        icon={Briefcase}    color="#10b981" sub={`${summary.totalDepartments} departments`} />
//               <StatCard label="Pending Invites"  value={summary.pendingInvites}    icon={UserPlus}     color="#f59e0b" sub="awaiting acceptance" />
//               <StatCard label="Plan"             value={summary.plan}              icon={CreditCard}   color="#6366f1" sub={summary.planActive ? "Active" : "Inactive"} />
//             </div>
//           </div>

//           {/* Stat cards row 2 */}
//           <div>
//             <SectionTitle>OKR Health</SectionTitle>
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//               <StatCard label="Total Objectives" value={summary.totalObjectives}  icon={Target}       color="#6366f1" sub={`${summary.completedOKRs} completed`} />
//               <StatCard label="Avg Completion"   value={`${summary.avgCompletion}%`} icon={TrendingUp} color="#10b981" sub="across all OKRs" trend={summary.avgCompletion > 60 ? "up" : "down"} />
//               <StatCard label="At Risk"          value={charts.okrStatus.find(s => s.name === "At Risk")?.value ?? 0} icon={AlertTriangle} color="#ef4444" sub="need attention" trend="down" />
//               <StatCard label="Avg Review Rating" value={summary.avgRating > 0 ? `${summary.avgRating}/5` : "N/A"} icon={Star} color="#f59e0b" sub={`${summary.totalReviews} reviews`} />
//             </div>
//           </div>

//           {/* Charts row 1 — Donut + Area */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <ChartCard title="OKR Status" sub="Current distribution">
//               <ResponsiveContainer width="100%" height={180}>
//                 <PieChart>
//                   <Pie
//                     data={charts.okrStatus}
//                     cx="50%" cy="50%"
//                     innerRadius={50} outerRadius={75}
//                     paddingAngle={3} dataKey="value"
//                   >
//                     {charts.okrStatus.map((e, i) => (
//                       <Cell key={i} fill={e.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(v, n) => [v, n]} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
//                 {charts.okrStatus.map((s) => (
//                   <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
//                     <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
//                     <span className="truncate">{s.name}</span>
//                     <span className="ml-auto font-medium text-foreground">{s.value}</span>
//                   </div>
//                 ))}
//               </div>
//             </ChartCard>

//             <ChartCard title="OKR Completion Trend" sub="Last 6 months — avg progress" className="lg:col-span-2">
//               <ResponsiveContainer width="100%" height={200}>
//                 <AreaChart data={charts.monthlyOKRTrend}>
//                   <defs>
//                     <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
//                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
//                   <Tooltip formatter={(v) => [`${v}%`, "Avg Progress"]} />
//                   <Area
//                     type="monotone" dataKey="avgProgress"
//                     stroke="#6366f1" strokeWidth={2}
//                     fill="url(#g1)"
//                     dot={{ r: 3, fill: "#6366f1" }}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>

//           {/* Charts row 2 — Dept bar + Members growth */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <ChartCard title="Department Performance" sub="Avg OKR completion %">
//               <ResponsiveContainer width="100%" height={210}>
//                 <BarChart data={charts.deptPerformance} layout="vertical">
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
//                   <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
//                   <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
//                   <Tooltip formatter={(v) => [`${v}%`, "Avg Completion"]} />
//                   <Bar dataKey="avgCompletion" radius={[0, 4, 4, 0]}>
//                     {charts.deptPerformance.map((_, i) => (
//                       <Cell key={i} fill={i % 2 === 0 ? "#6366f1" : "#10b981"} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartCard>

//             <ChartCard title="New Members Growth" sub="Last 6 months">
//               <ResponsiveContainer width="100%" height={210}>
//                 <BarChart data={charts.monthlyNewMembers}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="count" name="New Members" fill="#10b981" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>

//           {/* Charts row 3 — Role pie + Priority radar */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <ChartCard title="Role Distribution">
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={charts.roleDistribution}
//                     cx="50%" cy="50%" outerRadius={75}
//                     dataKey="value"
//                     label={({ name, percent }) =>
//                       `${(name ?? "").split(" ")[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
//                     }
//                     labelLine={false}
//                   >
//                     {charts.roleDistribution.map((_, i) => (
//                       <Cell key={i} fill={["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6"][i % 5]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </ChartCard>

//             <ChartCard title="OKR Priority Breakdown">
//               <ResponsiveContainer width="100%" height={200}>
//                 <RadarChart data={charts.priorityDist}>
//                   <PolarGrid stroke="hsl(var(--border))" />
//                   <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
//                   <Radar name="OKRs" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
//                   <Tooltip />
//                 </RadarChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>

//           {/* Recent objectives table */}
//           <ChartCard title="Recent Objectives" sub="Latest OKRs across the organization">
//             {recentObjectives.length === 0 ? (
//               <div className="text-center py-10 text-sm text-muted-foreground">
//                 No objectives created yet.
//                 <span className="block mt-1 text-xs">Go to Objectives to create your first OKR.</span>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {recentObjectives.map((obj) => (
//                   <div key={obj.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium truncate">{obj.title}</p>
//                       <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
//                         <span>{obj.owner.name}</span>
//                         {obj.team && <><span>&middot;</span><span>{obj.team.name}</span></>}
//                         <span>&middot;</span>
//                         <span>{obj._count.keyResults} key results</span>
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-3 flex-shrink-0">
//                       <div className="w-24 hidden md:block">
//                         <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
//                           <span>Progress</span>
//                           <span>{Math.round(obj.progress)}%</span>
//                         </div>
//                         <div className="h-1.5 bg-muted rounded-full overflow-hidden">
//                           <div
//                             className="h-full rounded-full"
//                             style={{
//                               width: `${obj.progress}%`,
//                               background: STATUS_COLOR[obj.status] ?? "#94a3b8",
//                             }}
//                           />
//                         </div>
//                       </div>
//                       <span
//                         className="text-xs px-2 py-0.5 rounded-full font-medium"
//                         style={{
//                           background: `${STATUS_COLOR[obj.status]}18`,
//                           color: STATUS_COLOR[obj.status],
//                         }}
//                       >
//                         {STATUS_LABEL[obj.status] ?? obj.status}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </ChartCard>
//         </div>
//       )}

//       {/* ══════════════════════════════════════════════════
//           PEOPLE TAB
//       ══════════════════════════════════════════════════ */}
//       {tab === "people" && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//             <StatCard label="Total"    value={summary.totalEmployees}    icon={Users}        color="#6366f1" />
//             <StatCard label="Active"   value={summary.activeEmployees}   icon={CheckCircle2} color="#10b981" />
//             <StatCard label="Inactive" value={summary.inactiveEmployees} icon={Clock}        color="#ef4444" />
//             <StatCard label="Invites"  value={summary.pendingInvites}    icon={UserPlus}     color="#f59e0b" />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <ChartCard title="Members Growth" sub="Last 6 months">
//               <ResponsiveContainer width="100%" height={220}>
//                 <LineChart data={charts.monthlyNewMembers}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                   <Tooltip />
//                   <Line type="monotone" dataKey="count" name="New Members" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1" }} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </ChartCard>

//             <ChartCard title="Role Breakdown">
//               <ResponsiveContainer width="100%" height={220}>
//                 <BarChart data={charts.roleDistribution}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="name" tick={{ fontSize: 10 }} />
//                   <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
//                     {charts.roleDistribution.map((_, i) => (
//                       <Cell key={i} fill={["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6"][i % 5]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>

//           <ChartCard title="Recent Members">
//             {recentMembers.length === 0 ? (
//               <p className="text-sm text-muted-foreground text-center py-8">No members yet</p>
//             ) : (
//               <div className="space-y-2">
//                 {recentMembers.map((m) => (
//                   <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
//                     <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
//                       {m.name.slice(0, 2).toUpperCase()}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium">{m.name}</p>
//                       <p className="text-xs text-muted-foreground">{m.email} &middot; {m.role.replace("_", " ")}</p>
//                     </div>
//                     <div className="text-right flex-shrink-0">
//                       <p className="text-xs text-muted-foreground">{m.department?.name ?? "No dept"}</p>
//                     <p className="text-xs font-medium mt-0.5">{m._count.objectives} OKRs</p>
//                     </div>
//                     <div className={cn("w-2 h-2 rounded-full flex-shrink-0", m.isActive ? "bg-emerald-500" : "bg-red-400")} />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </ChartCard>
//         </div>
//       )}

//       {/* ══════════════════════════════════════════════════
//           OKRS TAB
//       ══════════════════════════════════════════════════ */}
//       {tab === "okrs" && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
//             {charts.okrStatus.map((s) => (
//               <div key={s.name} className="rounded-xl border border-border bg-card p-4">
//                 <p className="text-xs text-muted-foreground mb-2">{s.name}</p>
//                 <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
//               </div>
//             ))}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <ChartCard title="Completion Trend" sub="Last 6 months">
//               <ResponsiveContainer width="100%" height={220}>
//                 <AreaChart data={charts.monthlyOKRTrend}>
//                   <defs>
//                     <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
//                       <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
//                   <Tooltip formatter={(v) => [`${v}%`, "Avg Progress"]} />
//                   <Area type="monotone" dataKey="avgProgress" stroke="#10b981" strokeWidth={2} fill="url(#g2)" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </ChartCard>

//             <ChartCard title="Priority Breakdown">
//               <ResponsiveContainer width="100%" height={220}>
//                 <BarChart data={charts.priorityDist}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="name" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="value" name="OKRs" radius={[4, 4, 0, 0]}>
//                     {charts.priorityDist.map((p, i) => (
//                       <Cell key={i} fill={p.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>

//           <ChartCard title="Department OKR Performance" sub="Completion % and total count per dept">
//             <ResponsiveContainer width="100%" height={260}>
//               <BarChart data={charts.deptPerformance}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                 <XAxis dataKey="name" tick={{ fontSize: 11 }} />
//                 <YAxis yAxisId="left"  tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
//                 <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
//                 <Tooltip />
//                 <Legend wrapperStyle={{ fontSize: 12 }} />
//                 <Bar yAxisId="left"  dataKey="avgCompletion" name="Avg Completion %" fill="#6366f1" radius={[4, 4, 0, 0]} />
//                 <Bar yAxisId="right" dataKey="totalOKRs"     name="Total OKRs"      fill="#10b981" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>
//         </div>
//       )}

//       {/* ══════════════════════════════════════════════════
//           ACTIVITY TAB
//       ══════════════════════════════════════════════════ */}
//       {tab === "activity" && (
//         <ChartCard title="Recent Activity" sub="Latest actions across the organization">
//           {recentActivity.length === 0 ? (
//             <p className="text-sm text-muted-foreground text-center py-10">No activity yet</p>
//           ) : (
//             <div className="space-y-2">
//               {recentActivity.map((log) => (
//                 <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
//                   <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
//                     {log.user?.name?.slice(0, 2).toUpperCase() ?? "??"}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm">
//                       <span className="font-medium">{log.user?.name ?? "System"}</span>
//                       {" "}<span className="text-muted-foreground">{log.action}</span>
//                       {" "}<span className="font-medium text-primary">{log.entityType}</span>
//                     </p>
//                     <p className="text-xs text-muted-foreground mt-0.5">
//                       {new Date(log.createdAt).toLocaleString("en-IN", {
//                         day: "numeric", month: "short",
//                         hour: "2-digit", minute: "2-digit",
//                       })}
//                     </p>
//                   </div>
//                   <Activity size={13} className="text-muted-foreground flex-shrink-0 mt-1" />
//                 </div>
//               ))}
//             </div>
//           )}
//         </ChartCard>
//       )}
//     </div>
//   );
// }