// src/actions/review.actions.ts
"use server";

import { prisma }         from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z }              from "zod";

export type ActionResult =
  | { success: true;  message?: string; id?: string }
  | { success: false; error: string };

const ReviewSchema = z.object({
  employeeId:   z.string().min(1, "Employee is required"),
  rating:       z.coerce.number().min(1).max(5),
  reviewPeriod: z.string().min(1, "Review period is required"),
  strengths:    z.string().optional().nullable(),
  weakness:     z.string().optional().nullable(),
  feedback:     z.string().optional().nullable(),
});

// ── GET ALL REVIEWS — role aware ──────────────────────────────
export async function getReviews(organizationId: string, userId: string, role: string) {
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(role);

  return prisma.review.findMany({
    where: isManagerPlus
      ? { organizationId }
      : { organizationId, employeeId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      employee: { select: { id: true, name: true, avatar: true, designation: true, department: { select: { name: true } } } },
      reviewer: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export type ReviewListItem = Awaited<ReturnType<typeof getReviews>>[number];

// ── GET SINGLE REVIEW ─────────────────────────────────────────
export async function getReviewById(id: string, organizationId: string) {
  return prisma.review.findFirst({
    where:   { id, organizationId },
    include: {
      employee: { select: { id: true, name: true, avatar: true, designation: true, role: true, department: { select: { name: true } } } },
      reviewer: { select: { id: true, name: true, avatar: true, designation: true } },
    },
  });
}

// ── GET FORM DATA — employees to review ──────────────────────
export async function getReviewFormData(organizationId: string, reviewerId: string) {
  const employees = await prisma.user.findMany({
    where:   { organizationId, isActive: true, role: { not: "SUPER_ADMIN" }, NOT: { id: reviewerId } },
    select: {
      id: true, name: true, avatar: true, designation: true, role: true,
      department: { select: { name: true } },
      team:       { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
  return { employees };
}

export type ReviewFormData = Awaited<ReturnType<typeof getReviewFormData>>;

// ── CREATE REVIEW ─────────────────────────────────────────────
export async function createReview(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const parsed = ReviewSchema.safeParse({
    employeeId:   formData.get("employeeId") ?? "",
    rating:       formData.get("rating") ?? 3,
    reviewPeriod: formData.get("reviewPeriod") ?? "",
    strengths:    (formData.get("strengths") as string) || null,
    weakness:     (formData.get("weakness") as string) || null,
    feedback:     (formData.get("feedback") as string) || null,
  });

  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { employeeId, rating, reviewPeriod, strengths, weakness, feedback } = parsed.data;

  // Verify employee belongs to org
  const employee = await prisma.user.findFirst({
    where:  { id: employeeId, organizationId: user.organizationId },
    select: { id: true, name: true },
  });
  if (!employee) return { success: false, error: "Employee not found" };

  // Generate AI summary
  let aiSummary: string | null = null;
  try {
    aiSummary = generateAISummary({ rating, strengths, weakness, feedback, employeeName: employee.name });
  } catch { /* silent fail */ }

  const review = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        employeeId,
        reviewerId:     user.id,
        organizationId: user.organizationId,
        rating,
        reviewPeriod,
        strengths:  strengths ?? null,
        weakness:   weakness  ?? null,
        feedback:   feedback  ?? null,
        aiSummary,
      },
    });

    // Notify employee
    await tx.notification.create({
      data: {
        title:          "New performance review",
        message:        `${user.name} submitted your ${reviewPeriod} performance review`,
        type:           "REVIEW_SUBMITTED",
        userId:         employeeId,
        organizationId: user.organizationId,
        link:           `/reviews`,
      },
    });

    await tx.activityLog.create({
      data: {
        action:         "submitted review for",
        entityType:     "Review",
        entityId:       review.id,
        userId:         user.id,
        organizationId: user.organizationId,
        metadata:       { employeeName: employee.name, rating, reviewPeriod },
      },
    });

    return review;
  });

  revalidatePath("/reviews");
  return { success: true, message: "Review submitted successfully", id: review.id };
}

// ── EDIT REVIEW ───────────────────────────────────────────────
export async function editReview(id: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const review = await prisma.review.findFirst({
    where:  { id, organizationId: user.organizationId },
    select: { reviewerId: true, employee: { select: { name: true } } },
  });
  if (!review) return { success: false, error: "Review not found" };
  if (review.reviewerId !== user.id) return { success: false, error: "You can only edit your own reviews" };

  const parsed = ReviewSchema.safeParse({
    employeeId:   formData.get("employeeId") ?? "",
    rating:       formData.get("rating") ?? 3,
    reviewPeriod: formData.get("reviewPeriod") ?? "",
    strengths:    (formData.get("strengths") as string) || null,
    weakness:     (formData.get("weakness") as string) || null,
    feedback:     (formData.get("feedback") as string) || null,
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { rating, reviewPeriod, strengths, weakness, feedback } = parsed.data;

  const aiSummary = generateAISummary({
    rating, strengths, weakness, feedback,
    employeeName: review.employee.name,
  });

  await prisma.review.update({
    where: { id },
    data:  { rating, reviewPeriod, strengths, weakness, feedback, aiSummary },
  });

  revalidatePath("/reviews");
  return { success: true, message: "Review updated" };
}

// ── DELETE REVIEW ─────────────────────────────────────────────
export async function deleteReview(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();

  const review = await prisma.review.findFirst({
    where:  { id, organizationId: user.organizationId },
    select: { reviewerId: true },
  });
  if (!review) return { success: false, error: "Review not found" };

  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(user.role);
  if (!isManagerPlus && review.reviewerId !== user.id) {
    return { success: false, error: "Permission denied" };
  }

  await prisma.review.delete({ where: { id } });
  revalidatePath("/reviews");
  return { success: true, message: "Review deleted" };
}

// ── GET STATS — review analytics ─────────────────────────────
export async function getReviewStats(organizationId: string) {
  const [total, avgRating, byPeriod] = await Promise.all([
    prisma.review.count({ where: { organizationId } }),
    prisma.review.aggregate({ where: { organizationId }, _avg: { rating: true } }),
    prisma.review.groupBy({
      by:     ["reviewPeriod"],
      where:  { organizationId },
      _count: true,
      _avg:   { rating: true },
      orderBy: { reviewPeriod: "desc" },
    }),
  ]);

  return {
    total,
    avgRating: parseFloat((avgRating._avg.rating ?? 0).toFixed(1)),
    byPeriod:  byPeriod.map(p => ({
      period:    p.reviewPeriod,
      count:     p._count,
      avgRating: parseFloat((p._avg.rating ?? 0).toFixed(1)),
    })),
  };
}

// ── LOCAL AI SUMMARY GENERATOR ────────────────────────────────
function generateAISummary({
  rating, strengths, weakness, feedback, employeeName,
}: {
  rating: number; strengths?: string | null; weakness?: string | null;
  feedback?: string | null; employeeName: string;
}): string {
  const level =
    rating >= 4.5 ? "exceptional" :
    rating >= 3.5 ? "strong" :
    rating >= 2.5 ? "satisfactory" :
    "needs improvement";

  const parts: string[] = [`${employeeName} has shown ${level} performance this period with a rating of ${rating}/5.`];

  if (strengths) parts.push(`Key strengths include: ${strengths.slice(0, 100)}${strengths.length > 100 ? "..." : ""}`);
  if (weakness)  parts.push(`Areas for growth: ${weakness.slice(0, 100)}${weakness.length > 100 ? "..." : ""}`);
  if (feedback)  parts.push(`Manager feedback highlights: ${feedback.slice(0, 80)}${feedback.length > 80 ? "..." : ""}`);

  return parts.join(" ");
}