
import { notFound }       from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getObjectiveById } from "@/actions/objectives.actions";
import { ObjectiveDetailClient } from "@/components/objectives/objective-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ObjectiveDetailPage({ params }: Props) {
  const { id } = await params;
  const user   = await getCurrentUser();

  const objective = await getObjectiveById(id, user.organizationId);
  if (!objective) notFound();

  const isOwner       = objective.ownerId === user.id;
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(user.role);
  const canEdit        = isOwner || isManagerPlus;

  return (
    <ObjectiveDetailClient
      objective={objective}
      currentUserId={user.id}
      canEdit={canEdit}
      isManagerPlus={isManagerPlus}
    />
  );
}

