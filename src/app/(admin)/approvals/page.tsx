
import { Suspense }              from "react";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getPendingApprovals }   from "@/actions/okr-approval.actions";
import { ApprovalsClient }       from "@/components/approvals/approvals-client";
import { Skeleton }              from "@/components/ui/skeleton";
import { getOrgSubscription }    from "@/actions/subscription.actions";
import { LockedBanner }          from "@/components/shared/primium-gate";

async function ApprovalsContent({ orgId, userId }: { orgId: string; userId: string }) {
  const pending = await getPendingApprovals(orgId, userId);
  return <ApprovalsClient pending={pending} />;
}

export default async function ApprovalsPage() {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const { plan, features } = await getOrgSubscription(user.organizationId);

  if (!features.okrApprovalWorkflow) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">OKR Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and approve team OKRs</p>
        </div>
        <LockedBanner
          requiredPlan="BUSINESS"
          label="OKR Approval Workflow"
          description="Require manager approval before OKRs go live. Available on Business plan and above."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">OKR Approvals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review and approve pending OKRs from your team</p>
      </div>
      <Suspense fallback={<div className="space-y-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-32 rounded-xl"/>)}</div>}>
        <ApprovalsContent orgId={user.organizationId} userId={user.id} />
      </Suspense>
    </div>
  );
}
