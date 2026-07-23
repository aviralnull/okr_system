// // src/app/(admin)/dashboard/page.tsx
// import { Suspense }          from "react";
// import { getCurrentUser }    from "@/lib/auth";

// // Org Admin / Manager / HR imports
// import { getDashboardSummary, getDashboardCharts, getDashboardTables } from "@/actions/org-admin.data";
// import { SummaryCards }    from "@/components/dashboard/summary-cards";
// import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
// import { DashboardTables } from "@/components/dashboard/dashboard-tables";
// import { SummaryCardsSkeleton, ChartsSkeleton, TablesSkeleton } from "@/components/dashboard/skeletons";
// import { DashboardTabs }   from "@/components/dashboard/dashboard-tabs";

// // Employee imports
// import { getEmployeeDashboardData } from "@/actions/employee-dashboard.data";
// import { EmployeeDashboard }        from "@/components/dashboard/employee-dashboard";
// import { Skeleton }                 from "@/components/ui/skeleton";

// // ── Org Admin sections ────────────────────────────────────────
// async function SummarySection({ orgId }: { orgId: string }) {
//   const data = await getDashboardSummary(orgId);
//   return <SummaryCards data={data} />;
// }
// async function ChartsSection({ orgId }: { orgId: string }) {
//   const data = await getDashboardCharts(orgId);
//   return <DashboardCharts data={data} />;
// }
// async function TablesSection({ orgId }: { orgId: string }) {
//   const data = await getDashboardTables(orgId);
//   return <DashboardTables data={data} />;
// }

// // ── Employee section ──────────────────────────────────────────
// async function EmployeeSection({ userId, orgId, user }: {
//   userId: string;
//   orgId: string;
//   user: Awaited<ReturnType<typeof getCurrentUser>>;
// }) {
//   const data = await getEmployeeDashboardData(userId, orgId);
//   return <EmployeeDashboard user={user} data={data} />;
// }

// function EmployeeSkeleton() {
//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//         {Array.from({ length: 4 }).map((_, i) => (
//           <Skeleton key={i} className="h-24 rounded-xl" />
//         ))}
//       </div>
//       <Skeleton className="h-10 w-full rounded-lg" />
//       <Skeleton className="h-64 w-full rounded-xl" />
//       <Skeleton className="h-48 w-full rounded-xl" />
//     </div>
//   );
// }

// // ── PAGE — role check here ────────────────────────────────────
// export default async function DashboardPage() {
//   const user  = await getCurrentUser();
//   const orgId = user.organizationId;
//  console.log("dashboard/page" , user.role) 
//   console.log("dashboard/page" , user.email) 
//   // ── EMPLOYEE → apna dashboard ────────────────────────────
//   if (user.role === "EMPLOYEE") {
//     return (
//       <Suspense fallback={<EmployeeSkeleton />}>
//         <EmployeeSection userId={user.id} orgId={orgId} user={user} />
//       </Suspense>
//     );
//   }

//   // ── MANAGER / HR / ORG_ADMIN → full org dashboard ────────
//   const greeting =
//     new Date().getHours() < 12  ? "Good morning"
//     : new Date().getHours() < 17 ? "Good afternoon"
//     : "Good evening";

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
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
//         <div className="flex items-center gap-2 flex-wrap">
//           <a href="/departments"
//             className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium">
//             + New Department
//           </a>
//           <a href="/teams"
//             className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium">
//             + New Team
//           </a>
//           <a href="/invitations"
//             className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
//             + Invite Member
//           </a>
//         </div>
//       </div>

//       <DashboardTabs
//         summaryContent={
//           <Suspense fallback={<SummaryCardsSkeleton />}>
//             <SummarySection orgId={orgId} />
//           </Suspense>
//         }
//         chartsContent={
//           <Suspense fallback={<ChartsSkeleton />}>
//             <ChartsSection orgId={orgId} />
//           </Suspense>
//         }
//         tablesContent={
//           <Suspense fallback={<TablesSkeleton />}>
//             <TablesSection orgId={orgId} />
//           </Suspense>
//         }
//       />
//     </div>
//   );
// }





import { Suspense }          from "react";
import { getCurrentUser }    from "@/lib/auth";
import { Skeleton }          from "@/components/ui/skeleton";

// Org Admin imports
import { getDashboardSummary, getDashboardCharts, getDashboardTables } from "@/actions/org-admin.data";
import { SummaryCards }    from "@/components/dashboard/summary-cards";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardTables } from "@/components/dashboard/dashboard-tables";
import { SummaryCardsSkeleton, ChartsSkeleton, TablesSkeleton } from "@/components/dashboard/skeletons";
import { DashboardTabs }   from "@/components/dashboard/dashboard-tabs";

// Manager imports
import { getManagerDashboardData } from "@/actions/manager-dashboard.data";
import { ManagerDashboard }        from "@/components/dashboard/manager-dashboard";

// Employee imports
import { getEmployeeDashboardData } from "@/actions/employee-dashboard.data";
import { EmployeeDashboard }        from "@/components/dashboard/employee-dashboard";

// ── Org Admin sections ────────────────────────────────────────
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

// ── Manager section ───────────────────────────────────────────
async function ManagerSection({ userId, orgId, user }: {
  userId: string; orgId: string;
  user:   Awaited<ReturnType<typeof getCurrentUser>>;
}) {
  const data = await getManagerDashboardData(userId, orgId);
  return <ManagerDashboard user={user} data={data} />;
}

// ── Employee section ──────────────────────────────────────────
async function EmployeeSection({ userId, orgId, user }: {
  userId: string; orgId: string;
  user:   Awaited<ReturnType<typeof getCurrentUser>>;
}) {
  const data = await getEmployeeDashboardData(userId, orgId);
  return <EmployeeDashboard user={user} data={data} />;
}

function GenericSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────
export default async function DashboardPage() {
  const user  = await getCurrentUser();
  const orgId = user.organizationId;

  // ── EMPLOYEE ─────────────────────────────────────────────
  if (user.role === "EMPLOYEE") {
    return (
      <Suspense fallback={<GenericSkeleton />}>
        <EmployeeSection userId={user.id} orgId={orgId} user={user} />
      </Suspense>
    );
  }

  // ── MANAGER ──────────────────────────────────────────────
  if (user.role === "MANAGER") {
    return (
      <Suspense fallback={<GenericSkeleton />}>
        <ManagerSection userId={user.id} orgId={orgId} user={user} />
      </Suspense>
    );
  }

  // ── HR / ORG_ADMIN / SUPER_ADMIN — full org dashboard ────
  const greeting =
    new Date().getHours() < 12  ? "Good morning"
    : new Date().getHours() < 17 ? "Good afternoon"
    : "Good evening";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {greeting}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user.organization?.name} &middot;{" "}
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href="/departments" className="text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium">
            + New Department
          </a>
          <a href="/teams" className="text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium">
            + New Team
          </a>
          <a href="/invitations" className="text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
            + Invite Member
          </a>
        </div>
      </div>

      <DashboardTabs
        summaryContent={
          <Suspense fallback={<SummaryCardsSkeleton />}>
            <SummarySection orgId={orgId} />
          </Suspense>
        }
        chartsContent={
          <Suspense fallback={<ChartsSkeleton />}>
            <ChartsSection orgId={orgId} />
          </Suspense>
        }
        tablesContent={
          <Suspense fallback={<TablesSkeleton />}>
            <TablesSection orgId={orgId} />
          </Suspense>
        }
      />
    </div>
  );
}



