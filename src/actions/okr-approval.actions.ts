
"use server";

import { prisma }              from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { revalidatePath }      from "next/cache";
import { canUseFeature }       from "@/lib/plan-config";
import { getOrgSubscription }  from "@/actions/subscription.actions";

export type ActionResult =
  | { success: true;  message?: string }
  | { success: false; error: string };

// ── Submit OKR for approval ───────────────────────────────────
// Strategy: store "pending_approval" in ActivityLog metadata
// Status stays NOT_STARTED until manager approves
export async function submitForApproval(objectiveId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const { plan } = await getOrgSubscription(user.organizationId);

  if (!canUseFeature(plan, "okrApprovalWorkflow")) {
    return { success: false, error: "OKR approval workflow requires Business plan or above" };
  }

  const obj = await prisma.objective.findFirst({
    where:  { id: objectiveId, organizationId: user.organizationId, ownerId: user.id },
    select: { id: true, title: true },
  });
  if (!obj) return { success: false, error: "Objective not found" };

  // Mark as pending in activityLog
  await prisma.activityLog.create({
    data: {
      action:         "submitted for approval",
      entityType:     "Objective",
      entityId:       objectiveId,
      userId:         user.id,
      organizationId: user.organizationId,
      metadata:       { pendingApproval: true, submittedAt: new Date().toISOString() },
    },
  });

  // Notify manager
  if (user.managerId) {
    await prisma.notification.create({
      data: {
        title:          "OKR pending your approval",
        message:        `${user.name} submitted "${obj.title}" for approval`,
        type:           "OKR_ASSIGNED",
        userId:         user.managerId,
        organizationId: user.organizationId,
        link:           `/approvals`,
      },
    });
  }

  revalidatePath("/objectives");
  return { success: true, message: "OKR submitted for approval" };
}

// ── Approve OKR ───────────────────────────────────────────────
export async function approveOKR(objectiveId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const { plan } = await getOrgSubscription(user.organizationId);
  if (!canUseFeature(plan, "okrApprovalWorkflow")) {
    return { success: false, error: "OKR approval workflow requires Business plan" };
  }

  const obj = await prisma.objective.findFirst({
    where:  { id: objectiveId, organizationId: user.organizationId },
    select: { id: true, title: true, ownerId: true },
  });
  if (!obj) return { success: false, error: "Objective not found" };

  await prisma.$transaction(async (tx) => {
    // Mark approval in activityLog
    await tx.activityLog.create({
      data: {
        action:         "approved",
        entityType:     "Objective",
        entityId:       objectiveId,
        userId:         user.id,
        organizationId: user.organizationId,
        metadata:       { pendingApproval: false, approvedAt: new Date().toISOString() },
      },
    });

    // Set status to ON_TRACK (approved = active)
    await tx.objective.update({
      where: { id: objectiveId },
      data:  { status: "ON_TRACK" },
    });

    // Notify owner
    await tx.notification.create({
      data: {
        title:          "OKR approved ✅",
        message:        `${user.name} approved your OKR: "${obj.title}"`,
        type:           "OKR_ASSIGNED",
        userId:         obj.ownerId,
        organizationId: user.organizationId,
        link:           `/objectives/${objectiveId}`,
      },
    });
  });

  revalidatePath("/approvals");
  revalidatePath("/objectives");
  return { success: true, message: "OKR approved" };
}

// ── Reject OKR ────────────────────────────────────────────────
export async function rejectOKR(objectiveId: string, reason: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const obj = await prisma.objective.findFirst({
    where:  { id: objectiveId, organizationId: user.organizationId },
    select: { id: true, title: true, ownerId: true },
  });
  if (!obj) return { success: false, error: "Objective not found" };

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        action:         "rejected",
        entityType:     "Objective",
        entityId:       objectiveId,
        userId:         user.id,
        organizationId: user.organizationId,
        metadata:       { pendingApproval: false, rejected: true, reason },
      },
    });

    await tx.notification.create({
      data: {
        title:          "OKR needs revision",
        message:        `${user.name} returned your OKR for revision: "${reason}"`,
        type:           "OKR_ASSIGNED",
        userId:         obj.ownerId,
        organizationId: user.organizationId,
        link:           `/objectives/${objectiveId}`,
      },
    });
  });

  revalidatePath("/approvals");
  return { success: true, message: "OKR returned for revision" };
}

// ── Get pending approvals ─────────────────────────────────────
export async function getPendingApprovals(organizationId: string, managerId: string) {
  // Get team members of this manager
  const scopedUsers = await prisma.user.findMany({
    where:  { organizationId, managerId, isActive: true },
    select: { id: true },
  });

  const scopedIds = scopedUsers.map(u => u.id);
  if (scopedIds.length === 0) return [];

  // Get objectives that have been submitted for approval
  // but NOT yet approved/rejected
  const submittedLogs = await prisma.activityLog.findMany({
    where: {
      organizationId,
      entityType: "Objective",
      action:     "submitted for approval",
      userId:     { in: scopedIds },
    },
    select: { entityId: true },
  });

  const submittedIds = submittedLogs.map(l => l.entityId);
  if (submittedIds.length === 0) return [];

  // Filter out already approved/rejected
  const resolvedLogs = await prisma.activityLog.findMany({
    where: {
      organizationId,
      entityType: "Objective",
      action:     { in: ["approved", "rejected"] },
      entityId:   { in: submittedIds },
    },
    select: { entityId: true },
  });

  const resolvedIds = new Set(resolvedLogs.map(l => l.entityId));
  const pendingIds  = submittedIds.filter(id => !resolvedIds.has(id));

  if (pendingIds.length === 0) return [];

  return prisma.objective.findMany({
    where:   { id: { in: pendingIds }, organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      owner:      { select: { name: true, avatar: true, designation: true } },
      keyResults: { select: { id: true, title: true, targetValue: true, unit: true } },
    },
  });
}
