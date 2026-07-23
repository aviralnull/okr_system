import { Suspense }       from "react";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getAnalyticsData, getAnalyticsFilterData } from "@/actions/analytics.actions";
import { getManagerScope } from "@/actions/manager-dashboard.data";
import { AnalyticsClient }  from "@/components/analytics/analytics-client";
import { Skeleton }         from "@/components/ui/skeleton";
import { getOrgSubscription } from "@/actions/subscription.actions";

async function AnalyticsContent({ orgId, userId, role }: {
  orgId: string; userId: string; role: string;
}) {
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(role);
  const isManager     = role === "MANAGER";
  const isOrgAdmin    = ["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(role);

  // Manager gets pre-filtered filterData scoped to their dept+team only
  let filterData = undefined;

  if (isOrgAdmin) {
    // Org admin sees ALL teams + depts + members
    filterData = await getAnalyticsFilterData(orgId);
  } else if (isManager) {
    // Manager sees only their team + dept members
    const scope = await getManagerScope(userId, orgId);
    filterData = {
      teams:       scope.teamId       ? [{ id: scope.teamId,       name: scope.teamName ?? "My Team" }] : [],
      departments: scope.departmentId ? [{ id: scope.departmentId, name: scope.deptName ?? "My Department" }] : [],
      members:     await import("@/lib/prisma").then(({ prisma }) =>
        prisma.user.findMany({
          where:   { id: { in: scope.scopedUserIds }, isActive: true },
          select:  { id: true, name: true, avatar: true },
          orderBy: { name: "asc" },
        })
      ),
    };
  }

  // For manager, default filter to their scope
  const defaultFilter = isManager
    ? { teamId: (await getManagerScope(userId, orgId)).teamId ?? undefined }
    : undefined;

  const data = await getAnalyticsData(orgId, userId, role, defaultFilter);
  const { plan } = await getOrgSubscription(orgId);

  return (
    <AnalyticsClient
      initialData={data}
      filterData={filterData}
      orgId={orgId}
      userId={userId}
      role={role}
        plan={plan}
      
    />
  );
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {["ORG_ADMIN", "SUPER_ADMIN"].includes(user.role)
            ? "Track OKR performance across your organization"
            : user.role === "MANAGER"
            ? "Track performance for your team and department"
            : "Track OKR performance"}
        </p>
      </div>
      <Suspense fallback={
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      }>
        <AnalyticsContent orgId={user.organizationId} userId={user.id} role={user.role} />
      </Suspense>
    </div>
  );
}
