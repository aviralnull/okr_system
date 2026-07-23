// 'use server'
// import {prisma} from "@/lib/prisma"
// export async function  getOrgAdminDashboardData(organizationId :string){
//   const last6Months = Array.from({length:6},(_ ,i)=>{
//     const d = new Date() ;
//     d.setMonth(d.getMonth() - (5-i)) ;
//     return {
//       label : d.toLocaleString("default" , {month : 'short'}) ,
//       year : d.getFullYear() ,
//       month : d.getMonth()
//     } ;

//   } ) ;
//   const [
//    totalEmployees ,
//    activeEmployees ,
//    totalTeams ,
//    totalDepartments ,
//    allObjectives,
//    pendingInvites,
//    recentActivity,
//    recentMembers ,
//    subscription,
//    allReviews,
//    unreadNotifications,
//    roleDistribution,
//    departments ,

//   ] = await Promise.all([
//     prisma.user.count({
//       where: {organizationId , role : {not :"SUPER_ADMIN"}} ,
//     }) ,
//     prisma.user.count({
//       where: {organizationId , isActive:true , role :{not :"SUPER_ADMIN"}} ,
//     }) ,
//     prisma.team.count({where : {organizationId}}) ,
//     prisma.department.count({where : {organizationId}}) ,
//     prisma.objective.findMany({
//       where : {organizationId} ,
//       include : {
//         keyResults: true ,
//         owner : {select: {name: true ,avatar:true , role : true}} ,
//         team : {select : {name: true}},
//         progressUpdates : {orderBy : {createdAt: "desc"} , take:1} ,
//       },
//       orderBy : {createdAt : "desc"} ,

//     }) ,
//     prisma.invite.count({where: {organizationId, status: "PENDING"}}),
//     prisma.activityLog.findMany({
//       where: {organizationId} ,
//       orderBy: {createdAt : "desc"},
//       take : 8,
//       include : {user : {select: {name : true , avatar: true}}} ,


//     }) ,
//     prisma.user.findMany({
//       where: {organizationId , role :{not : "SUPER_ADMIN"}} ,
//       include: {
//         department : {select: {name : true}} ,
//         team :      {select: {name : true}} ,
//         objectives : {select: {status: true , progress : true}} ,

//       } ,
//       orderBy : {joinedAt : "desc"} ,
//       take : 6 ,
//     }) ,
//     prisma.subscription.findFirst({where: {organizationId}}) ,
//     prisma.review.findMany({
//       where: {organizationId} ,
//       select : {rating: true , createdAt: true},

//     }) ,
//     prisma.notification.count({where: {organizationId , isRead: false}}) ,
//     prisma.user.groupBy({
//       by : ["role"] ,
//       where : {organizationId} ,
//       _count : true ,
//     }) ,
//     prisma.department.findMany({
//       where : {organizationId} ,
//       include: {
//         users: {
//           include : {
//             objectives: {select: {progress: true ,status :true}} ,
//           }
//         }
//       }
//     }) ,


//   ]) ;

//   const onTrack = allObjectives.filter((o)=>o.status ==="ON_TRACK").length ;
//   const atRisk = allObjectives.filter((o)=>o.status ==="AT_RISK").length ;
//   const behind = allObjectives.filter((o)=>o.status ==="BEHIND").length ;
//   const completed =allObjectives.filter((o)=>o.status ==="COMPLETED").length ;
//   const notStarted =  allObjectives.filter((o)=>o.status ==="NOT_STARTED").length ;
//   const  avgCompletion = allObjectives.length>0?Math.round(allObjectives.reduce((a,o)=>a +o.progress, 0)/allObjectives.length ):0 ;

//   const  avgRating = allReviews.length > 0
//       ? parseFloat(
//           (allReviews.reduce((a, r) => a + r.rating, 0) / allReviews.length).toFixed(1)
//         )
//       : 0;

//       const deptStats = departments.map((dept)=>{
//         const objs = dept.users.flatMap((u)=>u.objectives) ;
//         const avg = objs.length>0 ?Math.round(objs.reduce((a,o)=> a+o.progress, 0)/objs.length):0 ;
//         return {
//           name : dept.name ,
//           avgCompletion : avg ,
//           totalOKRs : objs.length,
//           memberCount : dept.users.length,

//         } ;

//       }) ;
//       const monthlyNewMembers = await Promise.all(
//         last6Months.map(async ({label , year , month})=>{
//           const start = new Date(year, month , 1) ;
//           const end = new Date(year ,month+1 ,0,23 ,59,59) ;
//           const count = await  prisma.user.count({
//             where: {organizationId , joinedAt : {gte: start, lte:end}} ,

//           }) ;
//           return {month:label ,count} ;
//         })
//       ) ;

//       const monthlyOKRTrend = await Promise.all(
//         last6Months.map(async ({label ,year ,month})=>{
//         const start = new Date(year, month, 1);
//       const end   = new Date(year, month + 1, 0, 23, 59, 59);
//       const objs = await prisma.objective.findMany({
//         where:{organizationId, createdAt: {gte :start , lte:end}} ,
//         select: {progress : true} ,


//       }) ;
//       const avg = objs.length>0 ?Math.round(objs.reduce((a,o)=>a+ o.progress , 0)/objs.length) : 0 ;
//       return {month : label , avgProgress : avg , total : objs.length }
//         })
//       ) ;
//       const priorityDist = await prisma.objective.groupBy({
//         by : ["priority"] ,
//         where : {organizationId} ,
//         _count : true 
//       }) ;
//       return  {
//         summary: {
//           totalEmployees,
//           activeEmployees,
//           inactiveEmployees : totalEmployees-activeEmployees ,
//           totalTeams ,
//           totalDepartments ,
//           totalObjectives : allObjectives.length ,
//           completedORKs :completed,
//           activeOKRs : allObjectives.filter((o)=>o.status !=="COMPLETED") ,
//           avgCompletion ,
//           pendingInvites ,
//           avgRating,
//           totalReviews : allReviews.length,
//           unreadNotifications,
//           plan : subscription?.plan  ??"FREE",
//           planActive :subscription?.active ??false ,
//         } ,
//         charts: {
//           okrStatus: [
//                { name: "On Track",    value: onTrack,    color: "#10b981" },
//         { name: "At Risk",     value: atRisk,     color: "#f59e0b" },
//         { name: "Behind",      value: behind,     color: "#ef4444" },
//         { name: "Completed",   value: completed,  color: "#6366f1" },
//         { name: "Not Started", value: notStarted, color: "#94a3b8" },
//           ] ,
//           deptPerformance: deptStats,
//           monthlyOKRTrend ,
//           monthlyNewMembers,
//           roleDistribution:roleDistribution.map((r)=>({
//             name: r.role.replace("_" ," "),
//             value: r._count,
//           })),
//           priorityDist: priorityDist.map((p)=>({
//             name : p.priority,
//             value :p._count ,
//             color :
//              p.priority === "CRITICAL" ? "#ef4444"
//           : p.priority === "HIGH"   ? "#f59e0b"
//           : p.priority === "MEDIUM" ? "#6366f1"
//           : "#94a3b8",
//           })),

//         },
//         recentObjectives : allObjectives.slice(0,5) ,
//         recentMembers,
//         recentActivity
//       } ;



// } 

// export type OrgAdminDashboardData = Awaited<ReturnType<typeof getOrgAdminDashboardData>> ;


"use server";

import { prisma } from "@/lib/prisma";

// ── Single SQL query — sab counts ek saath ──────────────────
export async function getDashboardSummary(organizationId: string) {

  // One raw query — DB mein hi sab calculate hota hai
  const [summary] = await prisma.$queryRaw<[{
    total_employees:      bigint;
    active_employees:     bigint;
    total_teams:          bigint;
    total_departments:    bigint;
    pending_invites:      bigint;
    unread_notifications: bigint;
    total_objectives:     bigint;
    completed_okrs:       bigint;
    on_track:             bigint;
    at_risk:              bigint;
    behind:               bigint;
    not_started:          bigint;
    avg_completion:       number | null;
    total_reviews:        bigint;
    avg_rating:           number | null;
    plan:                 string | null;
    plan_active:          boolean | null;
  }]>`
    SELECT
      -- Employees
      (SELECT COUNT(*) FROM "User"
        WHERE "organizationId" = ${organizationId}
        AND role != 'SUPER_ADMIN')                            AS total_employees,

      (SELECT COUNT(*) FROM "User"
        WHERE "organizationId" = ${organizationId}
        AND "isActive" = true AND role != 'SUPER_ADMIN')      AS active_employees,

      -- Teams & Departments
      (SELECT COUNT(*) FROM "Team"
        WHERE "organizationId" = ${organizationId})           AS total_teams,

      (SELECT COUNT(*) FROM "Department"
        WHERE "organizationId" = ${organizationId})           AS total_departments,

      -- Invites & Notifications
      (SELECT COUNT(*) FROM "Invite"
        WHERE "organizationId" = ${organizationId}
        AND status = 'PENDING')                               AS pending_invites,

      (SELECT COUNT(*) FROM "Notification"
        WHERE "organizationId" = ${organizationId}
        AND "isRead" = false)                                 AS unread_notifications,

      -- OKR stats
      (SELECT COUNT(*) FROM "Objective"
        WHERE "organizationId" = ${organizationId})           AS total_objectives,

      (SELECT COUNT(*) FROM "Objective"
        WHERE "organizationId" = ${organizationId}
        AND status = 'COMPLETED')                             AS completed_okrs,

      (SELECT COUNT(*) FROM "Objective"
        WHERE "organizationId" = ${organizationId}
        AND status = 'ON_TRACK')                              AS on_track,

      (SELECT COUNT(*) FROM "Objective"
        WHERE "organizationId" = ${organizationId}
        AND status = 'AT_RISK')                               AS at_risk,

      (SELECT COUNT(*) FROM "Objective"
        WHERE "organizationId" = ${organizationId}
        AND status = 'BEHIND')                                AS behind,

      (SELECT COUNT(*) FROM "Objective"
        WHERE "organizationId" = ${organizationId}
        AND status = 'NOT_STARTED')                           AS not_started,

      (SELECT ROUND(AVG(progress)::numeric, 0) FROM "Objective"
        WHERE "organizationId" = ${organizationId})           AS avg_completion,

      -- Reviews
      (SELECT COUNT(*) FROM "Review"
        WHERE "organizationId" = ${organizationId})           AS total_reviews,

      (SELECT ROUND(AVG(rating)::numeric, 1) FROM "Review"
        WHERE "organizationId" = ${organizationId})           AS avg_rating,

      -- Subscription
      (SELECT plan::text FROM "Subscription"
        WHERE "organizationId" = ${organizationId}
        LIMIT 1)                                              AS plan,

      (SELECT active FROM "Subscription"
        WHERE "organizationId" = ${organizationId}
        LIMIT 1)                                              AS plan_active
  `;

  const n = (v: bigint) => Number(v);

  return {
    totalEmployees:      n(summary.total_employees),
    activeEmployees:     n(summary.active_employees),
    inactiveEmployees:   n(summary.total_employees) - n(summary.active_employees),
    totalTeams:          n(summary.total_teams),
    totalDepartments:    n(summary.total_departments),
    pendingInvites:      n(summary.pending_invites),
    unreadNotifications: n(summary.unread_notifications),
    totalObjectives:     n(summary.total_objectives),
    completedOKRs:       n(summary.completed_okrs),
    activeOKRs:          n(summary.total_objectives) - n(summary.completed_okrs),
    onTrack:             n(summary.on_track),
    atRisk:              n(summary.at_risk),
    behind:              n(summary.behind),
    notStarted:          n(summary.not_started),
    avgCompletion:       Math.round(Number(summary.avg_completion ?? 0)),
    totalReviews:        n(summary.total_reviews),
    avgRating:           parseFloat((Number(summary.avg_rating ?? 0)).toFixed(1)),
    plan:                (summary.plan ?? "FREE") as string,
    planActive:          summary.plan_active ?? false,
  };
}

// ── Charts — 2 queries total ─────────────────────────────────


export async function getDashboardCharts(organizationId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const last6Labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString("default", { month: "short" });
  });

  const [roleRaw, priorityRaw, membersRaw, deptRaw, okrTrendRaw] = await Promise.all([

    // 1. Role distribution
    prisma.$queryRaw<{ name: string; value: bigint }[]>`
      SELECT role::text AS name, COUNT(*)::bigint AS value
      FROM "User"
      WHERE "organizationId" = ${organizationId}
      GROUP BY role
    `,

    // 2. Priority distribution
    prisma.$queryRaw<{ name: string; value: bigint; color: string }[]>`
      SELECT
        priority::text AS name,
        COUNT(*)::bigint AS value,
        CASE priority
          WHEN 'CRITICAL' THEN '#ef4444'
          WHEN 'HIGH'     THEN '#f59e0b'
          WHEN 'MEDIUM'   THEN '#6366f1'
          ELSE '#94a3b8'
        END AS color
      FROM "Objective"
      WHERE "organizationId" = ${organizationId}
      GROUP BY priority
    `,

    // 3. Monthly new members — quoted "joinedAt"
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "joinedAt"), 'Mon') AS month,
        COUNT(*)::bigint AS count
      FROM "User"
      WHERE "organizationId" = ${organizationId}
        AND "joinedAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "joinedAt")
      ORDER BY DATE_TRUNC('month', "joinedAt")
    `,

    // 4. Department performance — quoted column names
    prisma.$queryRaw<{
      dept_name: string;
      member_count: bigint;
      total_okrs: bigint;
      avg_completion: number | null;
    }[]>`
      SELECT
        d.name                                      AS dept_name,
        COUNT(DISTINCT u.id)::bigint                AS member_count,
        COUNT(DISTINCT o.id)::bigint                AS total_okrs,
        ROUND(AVG(o.progress)::numeric, 0)          AS avg_completion
      FROM "Department" d
      LEFT JOIN "User"      u ON u."departmentId" = d.id
      LEFT JOIN "Objective" o ON o."ownerId"       = u.id
      WHERE d."organizationId" = ${organizationId}
      GROUP BY d.id, d.name
    `,

    // 5. Monthly OKR trend — quoted "createdAt"
    prisma.$queryRaw<{
      month: string;
      avg_progress: number;
      total: bigint;
    }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month,
        ROUND(AVG(progress)::numeric, 0)                 AS avg_progress,
        COUNT(*)::bigint                                  AS total
      FROM "Objective"
      WHERE "organizationId" = ${organizationId}
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
  ]);

  // ── Parse results ─────────────────────────────────────────
  const memberMap = new Map(membersRaw.map((r) => [r.month, Number(r.count)]));
  const okrMap    = new Map(okrTrendRaw.map((r) => [r.month, { avg: Number(r.avg_progress), total: Number(r.total) }]));

  return {
    roleDistribution: roleRaw.map((r) => ({
      name:  r.name.replace("_", " "),
      value: Number(r.value),
    })),
    priorityDist: priorityRaw.map((r) => ({
      name:  r.name,
      value: Number(r.value),
      color: r.color,
    })),
    deptPerformance: deptRaw.map((d) => ({
      name:          d.dept_name,
      memberCount:   Number(d.member_count),
      totalOKRs:     Number(d.total_okrs),
      avgCompletion: Math.round(Number(d.avg_completion ?? 0)),
    })),
    monthlyNewMembers: last6Labels.map((l) => ({
      month: l,
      count: memberMap.get(l) ?? 0,
    })),
    monthlyOKRTrend: last6Labels.map((l) => ({
      month:       l,
      avgProgress: okrMap.get(l)?.avg   ?? 0,
      total:       okrMap.get(l)?.total ?? 0,
    })),
  };
}

// ── Tables — 3 targeted queries ──────────────────────────────
export async function getDashboardTables(organizationId: string) {
  const [recentObjectives, recentMembers, recentActivity] = await Promise.all([
    prisma.objective.findMany({
      where:   { organizationId },
      orderBy: { createdAt: "desc" },
      take:    5,
      select: {
        id: true, title: true, progress: true, status: true,
        owner:  { select: { name: true } },
        team:   { select: { name: true } },
        _count: { select: { keyResults: true } },
      },
    }),
    prisma.user.findMany({
      where:   { organizationId, role: { not: "SUPER_ADMIN" } },
      orderBy: { joinedAt: "desc" },
      take:    6,
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, avatar: true,
        department: { select: { name: true } },
        team:       { select: { name: true } },
        _count:     { select: { objectives: true } },
      },
    }),
    prisma.activityLog.findMany({
      where:   { organizationId },
      orderBy: { createdAt: "desc" },
      take:    8,
      select: {
        id: true, action: true, entityType: true, createdAt: true,
        user: { select: { name: true, avatar: true } },
      },
    }),
  ]);

  return { recentObjectives, recentMembers, recentActivity };
}

export type DashboardSummary = Awaited<ReturnType<typeof getDashboardSummary>>;
export type DashboardCharts  = Awaited<ReturnType<typeof getDashboardCharts>>;
export type DashboardTables  = Awaited<ReturnType<typeof getDashboardTables>>;