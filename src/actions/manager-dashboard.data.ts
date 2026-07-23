"use server";

import { prisma } from "@/lib/prisma";

// ── Get manager's scope ───────────────────────────────────────
export async function getManagerScope(managerId: string, organizationId: string) {
  const manager = await prisma.user.findUnique({
    where:  { id: managerId },
    select: {
      teamId:       true,
      departmentId: true,
      team:         { select: { id: true, name: true } },
      department:   { select: { id: true, name: true } },
    },
  });

  // Scoped users: same team OR same department OR directly reports to manager
  const conditions: any[] = [{ managerId }];
  if (manager?.teamId)       conditions.push({ teamId:       manager.teamId });
  if (manager?.departmentId) conditions.push({ departmentId: manager.departmentId });

  const scopedUsers = await prisma.user.findMany({
    where: { organizationId, isActive: true, OR: conditions },
    select: { id: true },
  });

  return {
    teamId:        manager?.teamId       ?? null,
    departmentId:  manager?.departmentId ?? null,
    teamName:      manager?.team?.name   ?? null,
    deptName:      manager?.department?.name ?? null,
    scopedUserIds: scopedUsers.map(u => u.id),
  };
}

export async function getManagerDashboardData(managerId: string, organizationId: string) {
  const scope = await getManagerScope(managerId, organizationId);
  const { scopedUserIds } = scope;

  const currentQuarter = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;
  const sixMonthsAgo   = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);

  const [
    teamMembers,
    teamOKRs,
    atRiskOKRs,
    pendingReviews,
    myActivity,
    allScopedObjs,
    okrStatusGroups,
  ] = await Promise.all([

    // 1. Scoped members
    scopedUserIds.length > 0
      ? prisma.user.findMany({
          where:   { id: { in: scopedUserIds }, organizationId, isActive: true },
          select: {
            id: true, name: true, avatar: true, designation: true, role: true,
            department: { select: { name: true } },
            team:       { select: { name: true } },
            objectives: {
              where:  { organizationId },
              select: { id: true, progress: true, status: true },
            },
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),

    // 2. Team OKRs
    scopedUserIds.length > 0
      ? prisma.objective.findMany({
          where:   { ownerId: { in: scopedUserIds }, organizationId },
          orderBy: { createdAt: "desc" },
          take:    10,
          select: {
            id: true, title: true, progress: true, status: true,
            priority: true, quarter: true, dueDate: true,
            owner: { select: { name: true, avatar: true } },
            _count: { select: { keyResults: true } },
          },
        })
      : Promise.resolve([]),

    // 3. At-risk OKRs
    scopedUserIds.length > 0
      ? prisma.objective.findMany({
          where:   { ownerId: { in: scopedUserIds }, organizationId, status: { in: ["AT_RISK", "BEHIND"] } },
          orderBy: { dueDate: "asc" },
          select: {
            id: true, title: true, progress: true, status: true,
            dueDate: true, priority: true,
            owner: { select: { name: true, avatar: true } },
          },
        })
      : Promise.resolve([]),

    // 4. Members without review this quarter
    scopedUserIds.length > 0
      ? prisma.user.findMany({
          where: {
            id: { in: scopedUserIds }, organizationId, isActive: true,
            reviewsReceived: { none: { reviewPeriod: currentQuarter } },
          },
          select: { id: true, name: true, avatar: true, designation: true },
          take:   5,
        })
      : Promise.resolve([]),

    // 5. ✅ Only manager's OWN activity
    prisma.activityLog.findMany({
      where:   { userId: managerId, organizationId },
      orderBy: { createdAt: "desc" },
      take:    8,
      select: {
        id: true, action: true, entityType: true, createdAt: true,
        user: { select: { name: true, avatar: true } },
      },
    }),

    // 6. All scoped objs for trend
    scopedUserIds.length > 0
      ? prisma.objective.findMany({
          where:  { ownerId: { in: scopedUserIds }, organizationId, createdAt: { gte: sixMonthsAgo } },
          select: { progress: true, status: true, createdAt: true },
        })
      : Promise.resolve([]),

    // 7. Status groups
    scopedUserIds.length > 0
      ? prisma.objective.groupBy({
          by:    ["status"],
          where: { ownerId: { in: scopedUserIds }, organizationId },
          _count: true,
        })
      : Promise.resolve([]),
  ]);

  // Monthly trend
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i), 1);
    return { label: d.toLocaleString("default", { month: "short" }), date: d };
  });

  const monthlyTrend = last6.map(({ label, date }) => {
    const next    = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const objs    = allScopedObjs.filter(o => new Date(o.createdAt) >= date && new Date(o.createdAt) < next);
    const avg     = objs.length > 0 ? Math.round(objs.reduce((a, o) => a + o.progress, 0) / objs.length) : 0;
    return { month: label, avgProgress: avg, total: objs.length };
  });

  const totalOKRs     = teamOKRs.length;
  const completedOKRs = teamOKRs.filter(o => o.status === "COMPLETED").length;
  const avgCompletion = totalOKRs > 0
    ? Math.round(teamOKRs.reduce((a, o) => a + o.progress, 0) / totalOKRs) : 0;

  const getStatus = (s: string) => (okrStatusGroups as any[]).find((g: any) => g.status === s)?._count ?? 0;

  const memberStats = teamMembers.map(m => {
    const total     = m.objectives.length;
    const completed = m.objectives.filter(o => o.status === "COMPLETED").length;
    const avg       = total > 0 ? Math.round(m.objectives.reduce((a, o) => a + o.progress, 0) / total) : 0;
    return { ...m, total, completed, avgProgress: avg };
  }).sort((a, b) => b.avgProgress - a.avgProgress);

  return {
    scope,
    summary: {
      totalMembers:        teamMembers.length,
      totalOKRs,
      completedOKRs,
      atRiskCount:         atRiskOKRs.length,
      avgCompletion,
      pendingReviewsCount: pendingReviews.length,
    },
    teamOKRs,
    atRiskOKRs,
    pendingReviews,
    recentActivity: myActivity,
    memberStats,
    charts: {
      monthlyTrend,
      okrStatusChart: [
        { name: "On Track",    value: getStatus("ON_TRACK"),    color: "#10b981" },
        { name: "At Risk",     value: getStatus("AT_RISK"),     color: "#f59e0b" },
        { name: "Behind",      value: getStatus("BEHIND"),      color: "#ef4444" },
        { name: "Completed",   value: getStatus("COMPLETED"),   color: "#6366f1" },
        { name: "Not Started", value: getStatus("NOT_STARTED"), color: "#94a3b8" },
      ],
    },
  };
}

export type ManagerDashboardData = Awaited<ReturnType<typeof getManagerDashboardData>>;
export type ManagerScope         = Awaited<ReturnType<typeof getManagerScope>>;
