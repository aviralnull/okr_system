// src/actions/subscription.actions.ts
"use server";

import { prisma }         from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getPlanLimits, getPlanFeatures, type Plan } from "@/lib/plan-config";

export async function getOrgSubscription(organizationId: string) {
  const sub = await prisma.subscription.findFirst({
    where:   { organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, plan: true, active: true,
      currentPeriodEnd: true, cancelAtPeriodEnd: true,
      stripeCustomerId: true, stripeSubId: true,
    },
  });

  const plan = (sub?.plan ?? "FREE") as Plan;

  const [employeeCount, objectiveCount, teamCount, deptCount] = await Promise.all([
    prisma.user.count({ where: { organizationId, isActive: true, role: { not: "SUPER_ADMIN" } } }),
    prisma.objective.count({ where: { organizationId } }),
    prisma.team.count({ where: { organizationId } }),
    prisma.department.count({ where: { organizationId } }),
  ]);

  return {
    subscription: sub,
    plan,
    features: getPlanFeatures(plan),
    limits:   getPlanLimits(plan),
    usage:    { employeeCount, objectiveCount, teamCount, deptCount },
  };
}

export type OrgSubscription = Awaited<ReturnType<typeof getOrgSubscription>>;

export async function checkLimit(
  organizationId: string,
  field: "maxEmployees" | "maxObjectives" | "maxTeams" | "maxDepartments"
): Promise<{ allowed: boolean; plan: Plan; current: number; limit: number }> {
  const { plan, limits, usage } = await getOrgSubscription(organizationId);
  const countMap = {
    maxEmployees:   usage.employeeCount,
    maxObjectives:  usage.objectiveCount,
    maxTeams:       usage.teamCount,
    maxDepartments: usage.deptCount,
  };
  const current = countMap[field];
  const limit   = limits[field];
  return { allowed: limit === -1 || current < limit, plan, current, limit };
}

export async function upgradePlan(newPlan: Plan): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");
  if (newPlan === "ENTERPRISE") return { success: false, error: "Contact sales for Enterprise" };

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const existing  = await prisma.subscription.findFirst({
    where: { organizationId: user.organizationId }, select: { id: true },
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data:  { plan: newPlan, active: true, currentPeriodEnd: periodEnd },
    });
  } else {
    await prisma.subscription.create({
      data: { organizationId: user.organizationId, plan: newPlan, active: true, currentPeriodEnd: periodEnd },
    });
  }
  return { success: true };
}