
"use server";

import { prisma }              from "@/lib/prisma";
import { getCurrentUser }      from "@/lib/auth";
import { revalidatePath }      from "next/cache";
import { canUseFeature }       from "@/lib/plan-config";
import { getOrgSubscription }  from "@/actions/subscription.actions";

export type ActionResult =
  | { success: true;  message?: string }
  | { success: false; error: string };

// Request a peer review from a colleague
export async function requestPeerReview(data: {
  revieweeId:  string;
  reviewPeriod: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  const { plan } = await getOrgSubscription(user.organizationId);

  if (!canUseFeature(plan, "peer360Reviews")) {
    return { success: false, error: "360° Peer Reviews require Enterprise plan" };
  }

  const reviewee = await prisma.user.findFirst({
    where:  { id: data.revieweeId, organizationId: user.organizationId },
    select: { name: true },
  });
  if (!reviewee) return { success: false, error: "User not found" };

  // Create a review request notification
  await prisma.notification.create({
    data: {
      title:          "Peer review requested",
      message:        `${user.name} has requested a peer review from you for ${data.reviewPeriod}`,
      type:           "REVIEW_DUE",
      userId:         data.revieweeId,
      organizationId: user.organizationId,
      link:           `/reviews?peer=true&requesterId=${user.id}&period=${data.reviewPeriod}`,
    },
  });

  return { success: true, message: `Peer review requested from ${reviewee.name}` };
}

// Submit a peer review
export async function submitPeerReview(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  const { plan } = await getOrgSubscription(user.organizationId);

  if (!canUseFeature(plan, "peer360Reviews")) {
    return { success: false, error: "360° Peer Reviews require Enterprise plan" };
  }

  const revieweeId   = formData.get("revieweeId")   as string;
  const rating       = Number(formData.get("rating") ?? 3);
  const reviewPeriod = formData.get("reviewPeriod") as string;
  const strengths    = (formData.get("strengths")   as string) || null;
  const feedback     = (formData.get("feedback")    as string) || null;

  if (!revieweeId || !reviewPeriod) return { success: false, error: "Missing required fields" };

  // Reuse Review model with reviewerId = peer (not manager)
  await prisma.review.create({
    data: {
      employeeId:     revieweeId,
      reviewerId:     user.id,
      organizationId: user.organizationId,
      rating,
      reviewPeriod:   `${reviewPeriod} (Peer)`,
      strengths,
      feedback,
      aiSummary: `Peer review by ${user.name}: Rating ${rating}/5. ${strengths ? `Strengths: ${strengths.slice(0, 80)}` : ""}`,
    },
  });

  // Notify reviewee
  await prisma.notification.create({
    data: {
      title:          "New peer review received",
      message:        `${user.name} submitted a peer review for ${reviewPeriod}`,
      type:           "REVIEW_SUBMITTED",
      userId:         revieweeId,
      organizationId: user.organizationId,
      link:           "/reviews",
    },
  });

  revalidatePath("/reviews");
  return { success: true, message: "Peer review submitted" };
}

// Get peer reviews for current user
export async function getPeerReviews(organizationId: string, userId: string) {
  return prisma.review.findMany({
    where:   { organizationId, employeeId: userId, reviewPeriod: { contains: "(Peer)" } },
    orderBy: { createdAt: "desc" },
    include: { reviewer: { select: { name: true, avatar: true, designation: true } } },
  });
}

// Get colleagues to request peer review from (same team/dept)
export async function getPeerSuggestions(organizationId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { teamId: true, departmentId: true },
  });

  return prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      NOT: { id: userId },
      OR: [
        { teamId:       user?.teamId       ?? "" },
        { departmentId: user?.departmentId ?? "" },
      ],
    },
    select: { id: true, name: true, avatar: true, designation: true },
    take:   10,
  });
}
