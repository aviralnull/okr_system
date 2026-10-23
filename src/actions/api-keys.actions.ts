"use server";

import { prisma }              from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { revalidatePath }      from "next/cache";
import { canUseFeature }       from "@/lib/plan-config";
import { getOrgSubscription }  from "@/actions/subscription.actions";
import crypto                  from "crypto";

export type ActionResult =
  | { success: true;  message?: string; key?: string }
  | { success: false; error: string };



function generateApiKey(): string {
  return `okr_${crypto.randomBytes(32).toString("hex")}`;
}

export async function getApiKeys(organizationId: string) {
  const { plan } = await getOrgSubscription(organizationId);
  if (!canUseFeature(plan, "apiAccess")) return [];

  const logs = await prisma.activityLog.findMany({
    where: { organizationId, entityType: "ApiKey", action: { in: ["created", "active"] } },
    orderBy: { createdAt: "desc" },
    select: { entityId: true, metadata: true, createdAt: true, user: { select: { name: true } } },
  });

  return logs.map(l => {
    const meta = (l.metadata ?? {}) as any;
    return {
      id:        l.entityId,
      name:      meta.name       ?? "API Key",
      prefix:    meta.prefix     ?? "okr_****",
      createdAt: l.createdAt,
      createdBy: l.user.name,
      lastUsed:  meta.lastUsed   ?? null,
      revoked:   meta.revoked    ?? false,
    };
  }).filter(k => !k.revoked);
}

export async function createApiKey(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const { plan } = await getOrgSubscription(user.organizationId);
  if (!canUseFeature(plan, "apiAccess")) {
    return { success: false, error: "API access requires Business plan or above" };
  }

  const name = formData.get("name") as string;
  if (!name?.trim()) return { success: false, error: "Key name is required" };

  const key    = generateApiKey();
  const prefix = `${key.slice(0, 12)}...`;
  const id     = `key_${Date.now()}`;

  // Store hashed key — never store plain key
  const hashed = crypto.createHash("sha256").update(key).digest("hex");

  await prisma.activityLog.create({
    data: {
      action:         "created",
      entityType:     "ApiKey",
      entityId:       id,
      userId:         user.id,
      organizationId: user.organizationId,
      metadata:       { name, prefix, hashed, revoked: false },
    },
  });

  revalidatePath("/settings");
  // Return plain key ONCE — user must copy it now
  return { success: true, message: "API key created", key };
}

export async function revokeApiKey(keyId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const log = await prisma.activityLog.findFirst({
    where: { entityId: keyId, organizationId: user.organizationId, entityType: "ApiKey" },
  });
  if (!log) return { success: false, error: "Key not found" };

  await prisma.activityLog.update({
    where: { id: log.id },
    data:  { metadata: { ...(log.metadata as any), revoked: true }, action: "revoked" },
  });

  revalidatePath("/settings");
  return { success: true, message: "API key revoked" };
}
