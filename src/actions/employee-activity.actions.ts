
// "use server";

// import { prisma }              from "@/lib/prisma";
// import { getCurrentUser, requireRole } from "@/lib/auth";

// // ── Get employee's complete activity profile ──────────────────
// // Accessible by: ORG_ADMIN (all employees), MANAGER (their team/dept only)
// export async function getEmployeeActivity(employeeId: string) {
//   const viewer = await getCurrentUser();

//   // Permission check
//   const isOrgAdmin   = ["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(viewer.role);
//   const isManager    = viewer.role === "MANAGER";

//   if (!isOrgAdmin && !isManager) {
//     throw new Error("Unauthorized");
//   }

//   // Manager can only view employees in their scope
//   if (isManager) {
//     const scopedUser = await prisma.user.findFirst({
//       where: {
//         id:             employeeId,
//         organizationId: viewer.organizationId,
//         OR: [
//           { managerId:    viewer.id },
//           { teamId:       viewer.teamId       ?? undefined },
//           { departmentId: viewer.departmentId ?? undefined },
//           {
//             userTeams: {
//               some: { team: { users: { some: { id: viewer.id } } } },
//             },
//           },
//         ],
//       },
//       select: { id: true },
//     });
//     if (!scopedUser) throw new Error("Employee not in your scope");
//   }

//   const [
//     employee,
//     objectives,
//     keyResultLogs,
//     reviews,
//     activityLogs,
//     notifications,
//   ] = await Promise.all([
//     // Basic profile
//     prisma.user.findUnique({
//       where:  { id: employeeId },
//       select: {
//         id: true, name: true, email: true, avatar: true,
//         designation: true, role: true, joinedAt: true,
//         isActive: true, employeeId: true,
//         department: { select: { name: true } },
//         team:       { select: { name: true } },
//         manager:    { select: { name: true, avatar: true } },
//         userTeams: {
//           include: { team: { select: { name: true } } },
//         },
//         userDepartments: {
//           include: { department: { select: { name: true } } },
//         },
//       },
//     }),

//     // OKRs
//     prisma.objective.findMany({
//       where:   { ownerId: employeeId, organizationId: viewer.organizationId },
//       orderBy: { createdAt: "desc" },
//       include: {
//         keyResults: {
//           include: {
//             progressLogs: {
//               orderBy: { createdAt: "desc" },
//               take:    5,
//             },
//           },
//         },
//         comments:       { orderBy: { createdAt: "desc" }, take: 3 },
//         progressUpdates: { orderBy: { createdAt: "desc" }, take: 5 },
//       },
//     }),

//     // KR update history
//     prisma.keyResultLog.findMany({
//       where: {
//         keyResult: {
//           objective: { ownerId: employeeId, organizationId: viewer.organizationId },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//       take:    20,
//       include: {
//         keyResult: { select: { title: true, objective: { select: { title: true } } } },
//       },
//     }),

//     // Reviews received
//     prisma.review.findMany({
//       where:   { employeeId, organizationId: viewer.organizationId },
//       orderBy: { createdAt: "desc" },
//       include: { reviewer: { select: { name: true, avatar: true } } },
//     }),

//     // Activity logs
//     prisma.activityLog.findMany({
//       where:   { userId: employeeId, organizationId: viewer.organizationId },
//       orderBy: { createdAt: "desc" },
//       take:    30,
//     }),

//     // Notification count (unread)
//     prisma.notification.count({
//       where: { userId: employeeId, organizationId: viewer.organizationId, isRead: false },
//     }),
//   ]);

//   // Derived stats
//   const totalOKRs      = objectives.length;
//   const completedOKRs  = objectives.filter(o => o.status === "COMPLETED").length;
//   const atRiskOKRs     = objectives.filter(o => o.status === "AT_RISK" || o.status === "BEHIND").length;
//   const avgCompletion  = totalOKRs > 0
//     ? Math.round(objectives.reduce((a, o) => a + o.progress, 0) / totalOKRs) : 0;
//   const avgRating = reviews.length > 0
//     ? parseFloat((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)) : 0;

//   // Last active (most recent activityLog)
//   const lastActive = activityLogs[0]?.createdAt ?? null;

//   // Weekly activity (last 7 days)
//   const weekAgo        = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//   const weeklyActivity = activityLogs.filter(l => new Date(l.createdAt) >= weekAgo).length;

//   return {
//     employee,
//     stats: {
//       totalOKRs, completedOKRs, atRiskOKRs, avgCompletion,
//       avgRating, totalReviews: reviews.length,
//       lastActive, weeklyActivity, unreadNotifications: notifications,
//     },
//     objectives,
//     keyResultLogs,
//     reviews,
//     activityLogs,
//   };
// }

// export type EmployeeActivityData = Awaited<ReturnType<typeof getEmployeeActivity>>;

// // ── Get all employees visible to viewer ───────────────────────
// export async function getVisibleEmployees() {
//   const viewer = await getCurrentUser();
//   const isOrgAdmin = ["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(viewer.role);
//   const isManager  = viewer.role === "MANAGER";

//   if (isOrgAdmin) {
//     return prisma.user.findMany({
//       where:   { organizationId: viewer.organizationId, isActive: true, role: { not: "SUPER_ADMIN" } },
//       select:  { id: true, name: true, avatar: true, designation: true, role: true, department: { select: { name: true } }, team: { select: { name: true } } },
//       orderBy: { name: "asc" },
//     });
//   }

//   if (isManager) {
//     return prisma.user.findMany({
//       where: {
//         organizationId: viewer.organizationId,
//         isActive:       true,
//         OR: [
//           { managerId:    viewer.id },
//           { teamId:       viewer.teamId ?? undefined },
//           { departmentId: viewer.departmentId ?? undefined },
//         ],
//       },
//       select:  { id: true, name: true, avatar: true, designation: true, role: true, department: { select: { name: true } }, team: { select: { name: true } } },
//       orderBy: { name: "asc" },
//     });
//   }

//   return [];
// }





// src/actions/employee-activity.actions.ts
"use server";

import { prisma }              from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

// ── Get employee's complete activity profile ──────────────────
// Accessible by: ORG_ADMIN (all employees), MANAGER (their team/dept only)
export async function getEmployeeActivity(employeeId: string) {
  const viewer = await getCurrentUser();

  // Permission check
  const isOrgAdmin   = ["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(viewer.role);
  const isManager    = viewer.role === "MANAGER";

  if (!isOrgAdmin && !isManager) {
    throw new Error("Unauthorized");
  }

  // Manager can only view employees in their scope
  if (isManager) {
    const scopedUser = await prisma.user.findFirst({
      where: {
        id:             employeeId,
        organizationId: viewer.organizationId,
        OR: [
          { managerId:    viewer.id },
          { teamId:       viewer.teamId       ?? undefined },
          { departmentId: viewer.departmentId ?? undefined },
          
        ],
      },
      select: { id: true },
    });
    if (!scopedUser) throw new Error("Employee not in your scope");
  }

  const [
    employee,
    objectives,
    keyResultLogs,
    reviews,
    activityLogs,
    notifications,
  ] = await Promise.all([
    // Basic profile
    prisma.user.findUnique({
      where:  { id: employeeId },
      select: {
        id: true, name: true, email: true, avatar: true,
        designation: true, role: true, joinedAt: true,
        isActive: true, employeeId: true,
        department: { select: { name: true } },
        team:       { select: { name: true } },
        manager:    { select: { name: true, avatar: true } },
        
      },
    }),

    // OKRs
    prisma.objective.findMany({
      where:   { ownerId: employeeId, organizationId: viewer.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        keyResults: {
          include: {
            progressLogs: {
              orderBy: { createdAt: "desc" },
              take:    5,
            },
          },
        },
        comments:       { orderBy: { createdAt: "desc" }, take: 3 },
        progressUpdates: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    }),

    // KR update history
    prisma.keyResultLog.findMany({
      where: {
        keyResult: {
          objective: { ownerId: employeeId, organizationId: viewer.organizationId },
        },
      },
      orderBy: { createdAt: "desc" },
      take:    20,
      include: {
        keyResult: { select: { title: true, objective: { select: { title: true } } } },
      },
    }),

    // Reviews received
    prisma.review.findMany({
      where:   { employeeId, organizationId: viewer.organizationId },
      orderBy: { createdAt: "desc" },
      include: { reviewer: { select: { name: true, avatar: true } } },
    }),

    // Activity logs
    prisma.activityLog.findMany({
      where:   { userId: employeeId, organizationId: viewer.organizationId },
      orderBy: { createdAt: "desc" },
      take:    30,
    }),

    // Notification count (unread)
    prisma.notification.count({
      where: { userId: employeeId, organizationId: viewer.organizationId, isRead: false },
    }),
  ]);

  // Derived stats
  const totalOKRs      = objectives.length;
  const completedOKRs  = objectives.filter(o => o.status === "COMPLETED").length;
  const atRiskOKRs     = objectives.filter(o => o.status === "AT_RISK" || o.status === "BEHIND").length;
  const avgCompletion  = totalOKRs > 0
    ? Math.round(objectives.reduce((a, o) => a + o.progress, 0) / totalOKRs) : 0;
  const avgRating = reviews.length > 0
    ? parseFloat((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)) : 0;

  // Last active (most recent activityLog)
  const lastActive = activityLogs[0]?.createdAt ?? null;

  // Weekly activity (last 7 days)
  const weekAgo        = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyActivity = activityLogs.filter(l => new Date(l.createdAt) >= weekAgo).length;

  return {
    employee,
    stats: {
      totalOKRs, completedOKRs, atRiskOKRs, avgCompletion,
      avgRating, totalReviews: reviews.length,
      lastActive, weeklyActivity, unreadNotifications: notifications,
    },
    objectives,
    keyResultLogs,
    reviews,
    activityLogs,
  };
}

export type EmployeeActivityData = Awaited<ReturnType<typeof getEmployeeActivity>>;

// ── Get all employees visible to viewer ───────────────────────
export async function getVisibleEmployees() {
  const viewer = await getCurrentUser();
  const isOrgAdmin = ["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(viewer.role);
  const isManager  = viewer.role === "MANAGER";

  if (isOrgAdmin) {
    return prisma.user.findMany({
      where:   { organizationId: viewer.organizationId, isActive: true, role: { not: "SUPER_ADMIN" } },
      select:  { id: true, name: true, avatar: true, designation: true, role: true, department: { select: { name: true } }, team: { select: { name: true } } },
      orderBy: { name: "asc" },
    });
  }

  if (isManager) {
    return prisma.user.findMany({
      where: {
        organizationId: viewer.organizationId,
        isActive:       true,
        OR: [
          { managerId:    viewer.id },
          { teamId:       viewer.teamId ?? undefined },
          { departmentId: viewer.departmentId ?? undefined },
        ],
      },
      select:  { id: true, name: true, avatar: true, designation: true, role: true, department: { select: { name: true } }, team: { select: { name: true } } },
      orderBy: { name: "asc" },
    });
  }

  return [];
}