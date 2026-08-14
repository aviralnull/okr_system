// src/app/(admin)/invitations/page.tsx
import { Suspense }              from "react";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getInvitations }        from "@/actions/invitation.actions";
import { InvitationsClient }     from "@/components/invitations/invitations-client";
import { Skeleton }              from "@/components/ui/skeleton";

async function InvitationsContent({ orgId }: { orgId: string }) {
  const invitations = await getInvitations(orgId);
  return <InvitationsClient invitations={invitations} />;
}

export default async function InvitationsPage() {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Invitations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Invite team members and manage pending invitations
        </p>
      </div>
      <Suspense fallback={<InvitationsSkeleton />}>
        <InvitationsContent orgId={user.organizationId} />
      </Suspense>
    </div>
  );
}

function InvitationsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-14 w-full rounded-xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}