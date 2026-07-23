// src/app/(admin)/team/page.tsx
import { Suspense }       from "react";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getTeamOKROverview } from "@/actions/objectives.actions";
import { TeamOverviewClient } from "@/components/teams/team-overview-client";
import { Skeleton }           from "@/components/ui/skeleton";

async function TeamOverviewContent({ orgId, userId }: { orgId: string; userId: string }) {
  const team = await getTeamOKROverview(orgId, userId);
  return <TeamOverviewClient team={team} />;
}

export default async function TeamOverviewPage() {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Team Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your team members' OKR progress in one place
        </p>
      </div>
      <Suspense fallback={<TeamOverviewSkeleton />}>
        <TeamOverviewContent orgId={user.organizationId} userId={user.id} />
      </Suspense>
    </div>
  );
}

function TeamOverviewSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}