
// // src/actions/branding.actions.ts
// "use server";

// import { prisma }              from "@/lib/prisma";
// import { getCurrentUser, requireRole } from "@/lib/auth";
// import { revalidatePath }      from "next/cache";
// import { canUseFeature }       from "@/lib/plan-config";
// import { getOrgSubscription }  from "@/actions/subscription.actions";

// export type ActionResult =
//   | { success: true;  message?: string }
//   | { success: false; error: string };

// export async function getBranding(organizationId: string) {
//   const org = await prisma.organization.findUnique({
//     where:  { id: organizationId },
//     select: { logo: true, name: true },
//   });

//   // Store branding in activityLog metadata
//   const log = await prisma.activityLog.findFirst({
//     where:   { organizationId, entityType: "Branding" },
//     orderBy: { createdAt: "desc" },
//     select:  { metadata: true },
//   });

//   const meta = (log?.metadata ?? {}) as any;
//   return {
//     logo:         org?.logo     ?? null,
//     primaryColor: meta.primaryColor ?? "#6366f1",
//     orgName:      org?.name     ?? "OKR Desk",
//     favicon:      meta.favicon  ?? null,
//   };
// }

// export async function updateBranding(formData: FormData): Promise<ActionResult> {
//   const user = await getCurrentUser();
//   requireRole(user.role, "ORG_ADMIN");

//   const { plan } = await getOrgSubscription(user.organizationId);
//   if (!canUseFeature(plan, "customBranding")) {
//     return { success: false, error: "Custom branding requires Enterprise plan" };
//   }

//   const logo         = (formData.get("logo")         as string) || null;
//   const primaryColor = (formData.get("primaryColor") as string) || "#6366f1";
//   const favicon      = (formData.get("favicon")      as string) || null;

//   // Validate color
//   if (!/^#[0-9A-F]{6}$/i.test(primaryColor)) {
//     return { success: false, error: "Invalid color format. Use hex like #6366f1" };
//   }

//   await prisma.$transaction(async (tx) => {
//     // Update logo in org
//     if (logo) {
//       await tx.organization.update({
//         where: { id: user.organizationId },
//         data:  { logo },
//       });
//     }

//     // Store other branding in activityLog
//     await tx.activityLog.create({
//       data: {
//         action:         "updated",
//         entityType:     "Branding",
//         entityId:       user.organizationId,
//         userId:         user.id,
//         organizationId: user.organizationId,
//         metadata:       { primaryColor, favicon, logo },
//       },
//     });
//   });

//   revalidatePath("/settings");
//   revalidatePath("/dashboard");
//   return { success: true, message: "Branding updated successfully" };
// }



// src/actions/branding.actions.ts
"use server";

import { prisma }              from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { revalidatePath }      from "next/cache";
import { canUseFeature }       from "@/lib/plan-config";
import { getOrgSubscription }  from "@/actions/subscription.actions";

export type ActionResult =
  | { success: true;  message?: string }
  | { success: false; error: string };

// ── Get branding ──────────────────────────────────────────────
export async function getBranding(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where:  { id: organizationId },
    select: { logo: true, name: true },
  });

  // Get saved branding config from activityLog metadata
  const log = await prisma.activityLog.findFirst({
    where:   { organizationId, entityType: "Branding", action: "updated" },
    orderBy: { createdAt: "desc" },
    select:  { metadata: true },
  });

  const meta = (log?.metadata ?? {}) as any;

  return {
    logo:         org?.logo          ?? null,
    primaryColor: meta.primaryColor  ?? "#6366f1",
    orgName:      org?.name          ?? "OKR Desk",
    favicon:      meta.favicon       ?? null,
  };
}

export type BrandingData = Awaited<ReturnType<typeof getBranding>>;

// ── Update branding ───────────────────────────────────────────
export async function updateBranding(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const { plan } = await getOrgSubscription(user.organizationId);
  if (!canUseFeature(plan, "customBranding")) {
    return { success: false, error: "Custom branding requires Enterprise plan" };
  }

  const logo         = (formData.get("logo")         as string)?.trim() || null;
  const primaryColor = (formData.get("primaryColor") as string)?.trim() || "#6366f1";
  const favicon      = (formData.get("favicon")      as string)?.trim() || null;

  // Validate hex color
  if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
    return { success: false, error: "Invalid color format. Use hex like #6366f1" };
  }

  await prisma.$transaction(async (tx) => {
    // ✅ Update logo in org table
    await tx.organization.update({
      where: { id: user.organizationId },
      data:  { logo: logo ?? undefined },
    });

    // ✅ Save full branding config in activityLog metadata
    await tx.activityLog.create({
      data: {
        action:         "updated",
        entityType:     "Branding",
        entityId:       user.organizationId,
        userId:         user.id,
        organizationId: user.organizationId,
        metadata:       {
          logo,
          primaryColor,
          favicon,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true, message: "Branding updated successfully" };
}