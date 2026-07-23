
import { notFound }       from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getTeamById, getTeamFormData } from "@/actions/team.actions";
import { TeamDetailClient }             from "@/components/teams/teams-detail-client";

interface Props { params: Promise<{ id: string }> }

export default async function TeamDetailPage({ params }: Props) {
  const { id } = await params;
  const user   = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const [team, formData] = await Promise.all([
    getTeamById(id, user.organizationId),
    getTeamFormData(user.organizationId),
  ]);

  if (!team) notFound();
  return <TeamDetailClient team={team} formData={formData} />;
}