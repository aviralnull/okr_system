// src/app/(admin)/teams/page.tsx
import { Suspense }       from "react";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getTeams, getTeamFormData }  from "@/actions/team.actions";
import { TeamsClient }    from "@/components/teams/teams-client";
import { prisma }         from "@/lib/prisma";
import { Skeleton }       from "@/components/ui/skeleton";

async function TeamsContent({ orgId, userId, role }: {
  orgId: string; userId: string; role: string;
}) {
  const isOrgAdmin = ["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(role);

  const [teams, formData, departments] = await Promise.all([
   
    getTeams(orgId, userId, role),
    getTeamFormData(orgId),
    prisma.department.findMany({
      where:   { organizationId: orgId },
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <TeamsClient
      teams={teams}
      formData={formData}
      departments={departments}
      isOrgAdmin={isOrgAdmin}
    />
  );
}

export default async function TeamsPage() {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Teams</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage teams and their members
        </p>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      }>
        <TeamsContent orgId={user.organizationId} userId={user.id} role={user.role} />
      </Suspense>
    </div>
  );
}