// src/actions/analytics.actions.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getAnalyticsData(
  organizationId: string,
  userId: string,
  role: string,
  filters?: { teamId?: string; departmentId?: string; memberId?: string }
) {
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(role);
  const now           = new Date();
  const sixMonthsAgo  = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const last6Labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleString("default", { month: "short" });
  });

  // Build owner filter based on team/dept/member selection
  let ownerFilter: { in: string[] } | undefined;

  if (isManagerPlus && filters?.memberId) {
    ownerFilter = { in: [filters.memberId] };
  } else if (isManagerPlus && filters?.teamId) {
    const teamUsers = await prisma.user.findMany({ where: { teamId: filters.teamId, organizationId }, select: { id: true } });
    ownerFilter = { in: teamUsers.map(u => u.id) };
  } else if (isManagerPlus && filters?.departmentId) {
    const deptUsers = await prisma.user.findMany({ where: { departmentId: filters.departmentId, organizationId }, select: { id: true } });
    ownerFilter = { in: deptUsers.map(u => u.id) };
  } else if (!isManagerPlus) {
    ownerFilter = { in: [userId] };
  }

  const objWhere: any = { organizationId };
  if (ownerFilter) objWhere.ownerId = ownerFilter;

  const [
    okrStatusGroups,
    okrPriorityGroups,
    avgProgressRaw,
    krStats,
    reviewStats,
    recentCompleted,
  ] = await Promise.all([
    prisma.objective.groupBy({ by: ["status"],   where: objWhere, _count: true }),
    prisma.objective.groupBy({ by: ["priority"], where: objWhere, _count: true }),
    prisma.objective.aggregate({ where: objWhere, _avg: { progress: true }, _count: { id: true } }),
    prisma.keyResult.aggregate({ where: { objective: objWhere }, _avg: { progress: true }, _count: { id: true } }),
    prisma.review.aggregate({
      where: ownerFilter ? { organizationId, employeeId: ownerFilter } : { organizationId },
      _avg:  { rating: true },
      _count: { id: true },
    }),
    prisma.objective.findMany({
      where:   { ...objWhere, status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take:    5,
      select: {
        id: true, title: true, progress: true, quarter: true, dueDate: true,
        owner: { select: { name: true, avatar: true } },
      },
    }),
  ]);

  // Monthly trend — filtered by owner if applicable
  const ownerIds = ownerFilter?.in;

  const monthlyOKRTrend = ownerIds
    ? await prisma.$queryRaw<{ month: string; avg_progress: number; total: bigint; completed: bigint }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month,
          ROUND(AVG(progress)::numeric, 0)                  AS avg_progress,
          COUNT(*)::bigint                                   AS total,
          COUNT(*) FILTER (WHERE status = 'COMPLETED')::bigint AS completed
        FROM "Objective"
        WHERE "organizationId" = ${organizationId}
          AND "ownerId" = ANY(${ownerIds})
          AND "createdAt" >= ${sixMonthsAgo}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt")
      `
    : await prisma.$queryRaw<{ month: string; avg_progress: number; total: bigint; completed: bigint }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month,
          ROUND(AVG(progress)::numeric, 0)                  AS avg_progress,
          COUNT(*)::bigint                                   AS total,
          COUNT(*) FILTER (WHERE status = 'COMPLETED')::bigint AS completed
        FROM "Objective"
        WHERE "organizationId" = ${organizationId}
          AND "createdAt" >= ${sixMonthsAgo}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt")
      `;

  const activityTrend = ownerIds
    ? await prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT TO_CHAR(DATE_TRUNC('month', krl."createdAt"), 'Mon') AS month, COUNT(*)::bigint AS count
        FROM "KeyResultLog" krl
        JOIN "KeyResult" kr ON kr.id = krl."keyResultId"
        JOIN "Objective" o  ON o.id  = kr."objectiveId"
        WHERE o."organizationId" = ${organizationId}
          AND o."ownerId" = ANY(${ownerIds})
          AND krl."createdAt" >= ${sixMonthsAgo}
        GROUP BY DATE_TRUNC('month', krl."createdAt")
        ORDER BY DATE_TRUNC('month', krl."createdAt")
      `
    : await prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT TO_CHAR(DATE_TRUNC('month', krl."createdAt"), 'Mon') AS month, COUNT(*)::bigint AS count
        FROM "KeyResultLog" krl
        JOIN "KeyResult" kr ON kr.id = krl."keyResultId"
        JOIN "Objective" o  ON o.id  = kr."objectiveId"
        WHERE o."organizationId" = ${organizationId}
          AND krl."createdAt" >= ${sixMonthsAgo}
        GROUP BY DATE_TRUNC('month', krl."createdAt")
        ORDER BY DATE_TRUNC('month', krl."createdAt")
      `;

  const deptPerformance = isManagerPlus && !filters?.memberId && !filters?.teamId
    ? await prisma.$queryRaw<{ name: string; total: bigint; completed: bigint; avg_progress: number; member_count: bigint }[]>`
        SELECT
          d.name,
          COUNT(DISTINCT o.id)::bigint                                           AS total,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'COMPLETED')::bigint    AS completed,
          ROUND(COALESCE(AVG(o.progress), 0)::numeric, 0)                       AS avg_progress,
          COUNT(DISTINCT u.id)::bigint                                           AS member_count
        FROM "Department" d
        LEFT JOIN "User"      u ON u."departmentId" = d.id
        LEFT JOIN "Objective" o ON o."ownerId"       = u.id AND o."organizationId" = ${organizationId}
        WHERE d."organizationId" = ${organizationId}
          ${filters?.departmentId ? prisma.$queryRaw`AND d.id = ${filters.departmentId}` : prisma.$queryRaw``}
        GROUP BY d.id, d.name
        ORDER BY avg_progress DESC
      `.catch(() => [])
    : [];

  const topPerformers = isManagerPlus && !filters?.memberId
    ? await prisma.$queryRaw<{ name: string; avatar: string | null; completed: bigint; avg_progress: number; total: bigint }[]>`
        SELECT
          u.name, u.avatar,
          COUNT(o.id) FILTER (WHERE o.status = 'COMPLETED')::bigint AS completed,
          ROUND(COALESCE(AVG(o.progress), 0)::numeric, 0)           AS avg_progress,
          COUNT(o.id)::bigint                                         AS total
        FROM "User" u
        LEFT JOIN "Objective" o ON o."ownerId" = u.id AND o."organizationId" = ${organizationId}
        WHERE u."organizationId" = ${organizationId}
          AND u."isActive" = true
          AND u.role != 'SUPER_ADMIN'
          ${ownerIds ? prisma.$queryRaw`AND u.id = ANY(${ownerIds})` : prisma.$queryRaw``}
        GROUP BY u.id, u.name, u.avatar
        HAVING COUNT(o.id) > 0
        ORDER BY avg_progress DESC
        LIMIT 8
      `.catch(() => [])
    : [];

  const getStatus = (s: string) => okrStatusGroups.find(g => g.status === s)?._count ?? 0;
  const okrMap      = new Map(monthlyOKRTrend.map(r => [r.month, { avg: Number(r.avg_progress), total: Number(r.total), completed: Number(r.completed) }]));
  const activityMap = new Map(activityTrend.map(r => [r.month, Number(r.count)]));

  return {
    summary: {
      totalOKRs:     avgProgressRaw._count.id,
      avgCompletion: Math.round(avgProgressRaw._avg.progress ?? 0),
      onTrack:       getStatus("ON_TRACK"),
      atRisk:        getStatus("AT_RISK"),
      behind:        getStatus("BEHIND"),
      completed:     getStatus("COMPLETED"),
      notStarted:    getStatus("NOT_STARTED"),
      totalKRs:      krStats._count.id,
      avgKRProgress: Math.round(krStats._avg.progress ?? 0),
      avgRating:     parseFloat((reviewStats._avg.rating ?? 0).toFixed(1)),
      totalReviews:  reviewStats._count.id,
    },
    charts: {
      okrStatus: [
        { name: "On Track",    value: getStatus("ON_TRACK"),    color: "#10b981" },
        { name: "At Risk",     value: getStatus("AT_RISK"),     color: "#f59e0b" },
        { name: "Behind",      value: getStatus("BEHIND"),      color: "#ef4444" },
        { name: "Completed",   value: getStatus("COMPLETED"),   color: "#6366f1" },
        { name: "Not Started", value: getStatus("NOT_STARTED"), color: "#94a3b8" },
      ],
      okrPriority: okrPriorityGroups.map(p => ({
        name: p.priority, value: p._count,
        color: p.priority === "CRITICAL" ? "#ef4444" : p.priority === "HIGH" ? "#f59e0b" : p.priority === "MEDIUM" ? "#6366f1" : "#94a3b8",
      })),
      monthlyTrend: last6Labels.map(l => ({ month: l, avgProgress: okrMap.get(l)?.avg ?? 0, total: okrMap.get(l)?.total ?? 0, completed: okrMap.get(l)?.completed ?? 0 })),
      activityByMonth: last6Labels.map(l => ({ month: l, updates: activityMap.get(l) ?? 0 })),
      deptPerformance: (deptPerformance as any[]).map(d => ({ name: d.name, total: Number(d.total), completed: Number(d.completed), avgProgress: Number(d.avg_progress), memberCount: Number(d.member_count) })),
      topPerformers: (topPerformers as any[]).map(p => ({ name: p.name, avatar: p.avatar, completed: Number(p.completed), avgProgress: Number(p.avg_progress), total: Number(p.total) })),
    },
    recentCompleted,
    isManagerPlus,
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;

// ── Filter dropdown data ────────────────────────────────────
export async function getAnalyticsFilterData(organizationId: string) {
  const [teams, departments, members] = await Promise.all([
    prisma.team.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { organizationId, isActive: true, role: { not: "SUPER_ADMIN" } },
      select: { id: true, name: true, avatar: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { teams, departments, members };
}

export type AnalyticsFilterData = Awaited<ReturnType<typeof getAnalyticsFilterData>>;