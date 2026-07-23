// src/actions/employee-dashboard.data.ts
"use server";
import { prisma } from "@/lib/prisma";

export async function getEmployeeDashboardData(userId: string, organizationId: string) {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    myObjectives,
    myReviews,
    notifications,
    profile,
    recentActivity,
    monthlyProgress,
    keyResultsAll,
  ] = await Promise.all([

    // My OKRs — full detail
    prisma.objective.findMany({
      where:   { ownerId: userId, organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        keyResults: {
          include: {
            progressLogs: {
              orderBy: { createdAt: "desc" },
              take: 3,
              select: { value: true, note: true, createdAt: true },
            },
          },
        },
        team:           { select: { name: true } },
        progressUpdates: { orderBy: { createdAt: "desc" }, take: 1 },
        _count:          { select: { progressUpdates: true, comments: true } },
      },
    }),

    // My reviews
    prisma.review.findMany({
      where:   { employeeId: userId },
      orderBy: { createdAt: "desc" },
      take:    10,
      include: {
        reviewer: { select: { name: true, avatar: true, designation: true } },
      },
    }),

    // Notifications
    prisma.notification.findMany({
      where:   { userId, organizationId },
      orderBy: { createdAt: "desc" },
      take:    20,
      select: {
        id: true, title: true, message: true,
        type: true, isRead: true, link: true, createdAt: true,
      },
    }),

    // Profile
    prisma.user.findUnique({
      where:  { id: userId },
      select: {
        id: true, name: true, email: true, avatar: true,
        designation: true, role: true, joinedAt: true, employeeId: true, bio: true,
        department:  { select: { name: true } },
        team:        { select: { name: true } },
        manager:     { select: { name: true, avatar: true, designation: true, email: true } },
        preferences: { select: { theme: true } },
        _count:      { select: { objectives: true } },
      },
    }),

    // Recent activity — my actions
    prisma.activityLog.findMany({
      where:   { userId, organizationId },
      orderBy: { createdAt: "desc" },
      take:    8,
      select: { id: true, action: true, entityType: true, createdAt: true },
    }),

    // Monthly OKR progress trend — last 6 months
    prisma.$queryRaw<{ month: string; avg_progress: number; count: bigint }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month,
        ROUND(AVG(progress)::numeric, 0)                 AS avg_progress,
        COUNT(*)::bigint                                  AS count
      FROM "Objective"
      WHERE "ownerId" = ${userId}
        AND "organizationId" = ${organizationId}
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,

    // All my key results for KR completion chart
    prisma.keyResult.findMany({
      where:   { objective: { ownerId: userId, organizationId } },
      select:  { progress: true, title: true },
    }),
  ]);

  // Derived stats
  const totalOKRs     = myObjectives.length;
  const onTrack       = myObjectives.filter(o => o.status === "ON_TRACK").length;
  const atRisk        = myObjectives.filter(o => o.status === "AT_RISK").length;
  const behind        = myObjectives.filter(o => o.status === "BEHIND").length;
  const completed     = myObjectives.filter(o => o.status === "COMPLETED").length;
  const notStarted    = myObjectives.filter(o => o.status === "NOT_STARTED").length;
  const avgCompletion = totalOKRs > 0
    ? Math.round(myObjectives.reduce((a, o) => a + o.progress, 0) / totalOKRs) : 0;
  const unreadCount   = notifications.filter(n => !n.isRead).length;
  const avgRating     = myReviews.length > 0
    ? parseFloat((myReviews.reduce((a, r) => a + r.rating, 0) / myReviews.length).toFixed(1)) : 0;

  // KR completion buckets
  const krCompleted   = keyResultsAll.filter(k => k.progress >= 100).length;
  const krInProgress  = keyResultsAll.filter(k => k.progress > 0 && k.progress < 100).length;
  const krNotStarted  = keyResultsAll.filter(k => k.progress === 0).length;

  // Monthly trend — fill missing months
  const last6Labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleString("default", { month: "short" });
  });
  const trendMap = new Map(monthlyProgress.map(r => [r.month, Number(r.avg_progress)]));
  const monthlyTrend = last6Labels.map(l => ({ month: l, progress: trendMap.get(l) ?? 0 }));

  return {
    summary: {
      totalOKRs, onTrack, atRisk, behind, completed, notStarted,
      avgCompletion, unreadCount, avgRating,
      totalReviews:  myReviews.length,
      totalKRs:      keyResultsAll.length,
      krCompleted, krInProgress, krNotStarted,
    },
    charts: {
      okrStatus: [
        { name: "On Track",    value: onTrack,    color: "#10b981" },
        { name: "At Risk",     value: atRisk,     color: "#f59e0b" },
        { name: "Behind",      value: behind,     color: "#ef4444" },
        { name: "Completed",   value: completed,  color: "#6366f1" },
        { name: "Not Started", value: notStarted, color: "#94a3b8" },
      ],
      monthlyTrend,
      krCompletion: [
        { name: "Completed",   value: krCompleted,  color: "#10b981" },
        { name: "In Progress", value: krInProgress, color: "#6366f1" },
        { name: "Not Started", value: krNotStarted, color: "#94a3b8" },
      ],
    },
    myObjectives,
    myReviews,
    notifications,
    profile,
    recentActivity,
  };
}

export type EmployeeDashboardData = Awaited<ReturnType<typeof getEmployeeDashboardData>>;