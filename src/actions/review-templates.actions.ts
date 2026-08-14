
"use server";

import { prisma }         from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { canUseFeature }  from "@/lib/plan-config";
import { getOrgSubscription } from "@/actions/subscription.actions";

export type ActionResult =
  | { success: true;  message?: string; id?: string }
  | { success: false; error: string };

// Note: ReviewTemplate model needs to be added to schema
// For now store as JSON in ActivityLog metadata as workaround
// OR add to schema:
// model ReviewTemplate { id, name, questions Json, organizationId, createdById, createdAt }

export async function getReviewTemplates(organizationId: string) {
  const { plan } = await getOrgSubscription(organizationId);
  if (!canUseFeature(plan, "customReviewTemplates")) return [];

  // Fetch from activityLog where entityType = "ReviewTemplate"
  const logs = await prisma.activityLog.findMany({
    where:   { organizationId, entityType: "ReviewTemplate", action: "created" },
    orderBy: { createdAt: "desc" },
    select: { entityId: true, metadata: true, createdAt: true, user: { select: { name: true } } },
  });

  return logs.map(l => ({
    id:        l.entityId,
    ...((l.metadata as any) ?? {}),
    createdAt: l.createdAt,
    createdBy: l.user.name,
  }));
}

export async function createReviewTemplate(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const { plan } = await getOrgSubscription(user.organizationId);
  if (!canUseFeature(plan, "customReviewTemplates")) {
    return { success: false, error: "Custom review templates require Business plan or above" };
  }

  const name      = formData.get("name") as string;
  const questions = JSON.parse(formData.get("questions") as string ?? "[]");

  if (!name) return { success: false, error: "Template name is required" };

  const id = `tmpl_${Date.now()}`;

  await prisma.activityLog.create({
    data: {
      action:         "created",
      entityType:     "ReviewTemplate",
      entityId:       id,
      userId:         user.id,
      organizationId: user.organizationId,
      metadata:       { name, questions },
    },
  });

  revalidatePath("/reviews");
  return { success: true, message: "Template created", id };
}
