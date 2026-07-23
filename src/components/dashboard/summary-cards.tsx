// components/dashboard/summary-cards.tsx
"use client";

import {
  Users, Target, Building2, UserPlus,
  TrendingUp, AlertTriangle, Star, CreditCard,
  CheckCircle2, Clock, Briefcase, Activity,
} from "lucide-react";
import type { DashboardSummary } from "@/actions/Dashboard_data_fast ";

function StatCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && (
          <p
            className={[
              "text-xs mt-1 flex items-center gap-1",
              trend === "up"   ? "text-emerald-500"
              : trend === "down" ? "text-red-500"
              : "text-muted-foreground",
            ].join(" ")}
          >
            {trend === "up"   && <TrendingUp size={10} />}
            {trend === "down" && <AlertTriangle size={10} />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export function SummaryCards({ data }: { data: DashboardSummary }) {
  return (
    <div className="space-y-4">
      {/* Row 1 — Organization */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Organization
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Employees" value={data.totalEmployees}
            icon={Users} color="#6366f1"
            sub={`${data.activeEmployees} active`} trend="up"
          />
          <StatCard
            label="Teams" value={data.totalTeams}
            icon={Briefcase} color="#10b981"
            sub={`${data.totalDepartments} departments`}
          />
          <StatCard
            label="Pending Invites" value={data.pendingInvites}
            icon={UserPlus} color="#f59e0b"
            sub="awaiting acceptance"
          />
          <StatCard
            label="Plan" value={data.plan}
            icon={CreditCard} color="#6366f1"
            sub={data.planActive ? "Active" : "Inactive"}
          />
        </div>
      </div>

      {/* Row 2 — OKR Health */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          OKR Health
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Objectives" value={data.totalObjectives}
            icon={Target} color="#6366f1"
            sub={`${data.completedOKRs} completed`}
          />
          <StatCard
            label="Avg Completion" value={`${data.avgCompletion}%`}
            icon={TrendingUp} color="#10b981"
            sub="across all OKRs"
            trend={data.avgCompletion > 60 ? "up" : "down"}
          />
          <StatCard
            label="At Risk" value={data.atRisk}
            icon={AlertTriangle} color="#ef4444"
            sub="need attention" trend={data.atRisk > 0 ? "down" : undefined}
          />
          <StatCard
            label="Avg Rating" value={data.avgRating > 0 ? `${data.avgRating}/5` : "N/A"}
            icon={Star} color="#f59e0b"
            sub={`${data.totalReviews} reviews`}
          />
        </div>
      </div>
    </div>
  );
}