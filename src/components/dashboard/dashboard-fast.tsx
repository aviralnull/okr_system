// app/(admin)/dashboard/page.tsx
import { Suspense }               from "react";
import { getCurrentUser }         from "@/lib/auth";
import {
  getDashboardSummary,
  getDashboardCharts,
  getDashboardTables,
} from "@/actions/Dashboard_data_fast ";

import { SummaryCards } from "./summary-cards";
import { DashboardCharts } from "./dashboard-charts";    
import { DashboardTables } from "./dashboard-tables";
import { SummaryCardsSkeleton , ChartsSkeleton ,  TablesSkeleton} from "./skeletons";

// ── Each section is its own async server component ─────────────────
// They load IN PARALLEL — page shows immediately, sections fill in

async function SummarySection({ orgId }: { orgId: string }) {
  const data = await getDashboardSummary(orgId);
  return <SummaryCards data={data} />;
}

async function ChartsSection({ orgId }: { orgId: string }) {
  const data = await getDashboardCharts(orgId);
  return <DashboardCharts data={data} />;
}

async function TablesSection({ orgId }: { orgId: string }) {
  const data = await getDashboardTables(orgId);
  return <DashboardTables data={data} />;
}

// ── Page ────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const orgId = user.organizationId;

  const greeting =
    new Date().getHours() < 12 ? "Good morning"
    : new Date().getHours() < 17 ? "Good afternoon"
    : "Good evening";

  return (
    <div className="space-y-6">

      {/* Header — instant, no data needed */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">
          {greeting}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {user.organization?.name} &middot;{" "}
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </p>
      </div>

      {/* Quick actions — instant */}
      <QuickActions />

      {/* Summary cards — loads first (fastest query) */}
      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummarySection orgId={orgId} />
      </Suspense>

      {/* Charts — loads in parallel with tables */}
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection orgId={orgId} />
      </Suspense>

      {/* Tables — loads in parallel with charts */}
      <Suspense fallback={<TablesSkeleton />}>
        <TablesSection orgId={orgId} />
      </Suspense>

    </div>
  );
}

function QuickActions() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a
        href="/departments/new"
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium"
      >
        + New Department
      </a>
      <a
        href="/teams/new"
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium"
      >
        + New Team
      </a>
      <a
        href="/invitations"
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
      >
        + Invite Member
      </a>
    </div>
  );
}