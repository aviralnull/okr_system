// components/dashboard/dashboard-charts.tsx
"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import type { DashboardCharts as DashboardChartsType } from "@/actions/Dashboard_data_fast "

function ChartCard({
  title, sub, children, className,
}: {
  title: string; sub?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={["rounded-xl border border-border bg-card p-5", className].filter(Boolean).join(" ")}>
      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function DashboardCharts({ data }: { data: DashboardChartsType }) {
  const okrStatus = [
    { name: "On Track",    value: 0, color: "#10b981" },
    { name: "At Risk",     value: 0, color: "#f59e0b" },
    { name: "Behind",      value: 0, color: "#ef4444" },
    { name: "Completed",   value: 0, color: "#6366f1" },
    { name: "Not Started", value: 0, color: "#94a3b8" },
  ];

  return (
    <div className="space-y-4">

      {/* Row 1 — Dept bar + OKR trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <ChartCard title="OKR Completion Trend" sub="Last 6 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.monthlyOKRTrend}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, "Avg Progress"]} />
              <Area
                type="monotone" dataKey="avgProgress"
                stroke="#6366f1" strokeWidth={2} fill="url(#g1)"
                dot={{ r: 3, fill: "#6366f1" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Role Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.roleDistribution}
                cx="50%" cy="50%" outerRadius={70}
                dataKey="value"
                label={({ name, percent }) =>
                  `${(name ?? "").split(" ")[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.roleDistribution.map((_, i) => (
                  <Cell key={i} fill={["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6"][i % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 — Dept performance + Members growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <ChartCard title="Department Performance" sub="Avg OKR completion %">
          {data.deptPerformance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No departments yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data.deptPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [`${v}%`, "Avg Completion"]} />
                <Bar dataKey="avgCompletion" radius={[0, 4, 4, 0]}>
                  {data.deptPerformance.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "#6366f1" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="New Members Growth" sub="Last 6 months">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data.monthlyNewMembers}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="New Members" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 — Priority radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="OKR Priority Breakdown">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={data.priorityDist}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <Radar name="OKRs" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Dept OKR vs Members" sub="Dual comparison">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.deptPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="totalOKRs"   name="OKRs"    fill="#6366f1" radius={[4,4,0,0]} />
              <Bar yAxisId="r" dataKey="memberCount" name="Members" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}


