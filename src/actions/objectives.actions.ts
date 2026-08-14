"use server";

import { prisma }         from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z }              from "zod";
import { redirect }       from "next/navigation";
import { sendOkrAssignedEmail } from "@/lib/send-emails";
import { checkLimit } from "@/actions/subscription.actions";

export type ActionResult =
  | { success: true;  message?: string; id?: string }
  | { success: false; error: string };

// ─────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────
const KeyResultSchema = z.object({
  title:       z.string().min(2, "Key result title required"),
  targetValue: z.coerce.number().positive("Target must be > 0"),
  unit:        z.string().optional(),
});

const CreateObjectiveSchema = z.object({
  title:        z.string().min(3, "Title must be at least 3 characters"),
  description:  z.string().optional().nullable(),
  assignType:   z.enum(["individual", "team", "department"]),
  ownerId:      z.string().optional().nullable(),
  teamId:       z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  quarter:      z.string().min(1, "Quarter is required"),
  priority:     z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  startDate:    z.string().min(1, "Start date required"),
  dueDate:      z.string().min(1, "Due date required"),
  keyResults:   z.array(KeyResultSchema).min(1, "At least one key result required"),
});

// ─────────────────────────────────────────────────────────────
// GET ALL OBJECTIVES — role-aware + filters
// ─────────────────────────────────────────────────────────────
export async function getObjectives(
  organizationId: string,
  userId:         string,
  role:           string,
  filters?: {
    teamId?:       string;
    departmentId?: string;
    ownerId?:      string;
    status?:       string;
  }
) {
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(role);

  // Build where clause
  const where: any = { organizationId };

  if (!isManagerPlus) {
    // Employee sees only their own
    where.ownerId = userId;
  } else {
    // Manager+ can filter
    if (filters?.teamId)       where.teamId       = filters.teamId;
    if (filters?.departmentId) {
      // Get all users in that department
      const deptUsers = await prisma.user.findMany({
        where:  { organizationId, departmentId: filters.departmentId },
        select: { id: true },
      });
      where.ownerId = { in: deptUsers.map(u => u.id) };
    }
    if (filters?.ownerId) where.ownerId = filters.ownerId;
    if (filters?.status && filters.status !== "ALL") where.status = filters.status;
  }

  return prisma.objective.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true,
      progress: true, status: true, priority: true,
      quarter: true, startDate: true, dueDate: true,
      teamId: true, createdAt: true,
      owner:     { select: { id: true, name: true, avatar: true, department: { select: { name: true } } } },
      team:      { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      _count:    { select: { keyResults: true, comments: true, progressUpdates: true } },
    },
  });
}

export type ObjectiveListItem = Awaited<ReturnType<typeof getObjectives>>[number];

// ─────────────────────────────────────────────────────────────
// GET FORM DATA — teams, departments, users
// ─────────────────────────────────────────────────────────────
export async function getObjectiveFormData(organizationId: string, currentUserId: string) {
  const [teams, departments, users] = await Promise.all([
    prisma.team.findMany({
      where:   { organizationId },
      select:  { id: true, name: true, _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      where:   { organizationId },
      select:  { id: true, name: true, _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where:   { organizationId, isActive: true, role: { not: "SUPER_ADMIN" } },
      select: {
        id: true, name: true, role: true, avatar: true,
        team:       { select: { name: true } },
        department: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);
  return { teams, departments, users, currentUserId };
}

export type ObjectiveFormData = Awaited<ReturnType<typeof getObjectiveFormData>>;

// ─────────────────────────────────────────────────────────────
// GET FILTER DATA — for objectives list filters
// ─────────────────────────────────────────────────────────────
export async function getObjectiveFilterData(organizationId: string) {
  const [teams, departments, members] = await Promise.all([
    prisma.team.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, avatar: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { teams, departments, members };
}

export type ObjectiveFilterData = Awaited<ReturnType<typeof getObjectiveFilterData>>;

// ─────────────────────────────────────────────────────────────
// GET SINGLE OBJECTIVE
// ─────────────────────────────────────────────────────────────
export async function getObjectiveById(id: string, organizationId: string) {
  return prisma.objective.findFirst({
    where:   { id, organizationId },
    include: {
      owner:     { select: { id: true, name: true, avatar: true, designation: true } },
      createdBy: { select: { id: true, name: true } },
      team:      { select: { id: true, name: true } },
      keyResults: {
        orderBy: { createdAt: "asc" },
        include: {
          progressLogs: {
            orderBy: { createdAt: "desc" },
            take:    10,
          },
        },
      },
      progressUpdates: {
        orderBy: { createdAt: "desc" },
        take:    20,
        include: { user: { select: { name: true, avatar: true } } },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  });
}

export type ObjectiveDetail = Awaited<ReturnType<typeof getObjectiveById>>;

// ─────────────────────────────────────────────────────────────
// GET TEAM OVERVIEW — manager sees each member's OKRs
// ─────────────────────────────────────────────────────────────
export async function getTeamOKROverview(organizationId: string, managerId: string) {
  // Get manager's team
  const manager = await prisma.user.findUnique({
    where:  { id: managerId },
    select: { teamId: true },
  });

  if (!manager?.teamId) return null;

  const team = await prisma.team.findFirst({
    where: { id: manager.teamId, organizationId },
    include: {
      users: {
        where: { isActive: true },
        select: {
          id: true, name: true, avatar: true, designation: true, role: true,
          objectives: {
            where:  { organizationId },
            select: {
              id: true, title: true, progress: true, status: true,
              quarter: true, dueDate: true, priority: true,
              _count: { select: { keyResults: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  return team;
}
      


async function validateManagerScope(
  managerId: string,
  organizationId: string,
  targetOwnerIds: string[]
): Promise<{ valid: boolean; error?: string }> {
  const manager = await prisma.user.findUnique({
    where:  { id: managerId },
    select: { teamId: true, departmentId: true, role: true },
  });

  // Org admins / HR have no restriction
  if (["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(manager?.role ?? "")) {
    return { valid: true };
  }

  // Get all users in manager's scope
  const scopedUsers = await prisma.user.findMany({
    where: {
      organizationId,
      OR: [
        { managerId },
        { teamId:       manager?.teamId       ?? undefined },
        { departmentId: manager?.departmentId ?? undefined },
        
      ],
    },
    select: { id: true },
  });

  const scopedIds = new Set([...scopedUsers.map(u => u.id), managerId]);

  // Check every target is in scope
  const outOfScope = targetOwnerIds.filter(id => !scopedIds.has(id));
  if (outOfScope.length > 0) {
    return {
      valid: false,
      error: `You can only assign OKRs to members in your team or department (${outOfScope.length} members are outside your scope)`,
    };
  }

  return { valid: true };
}












// ─────────────────────────────────────────────────────────────
// CREATE OBJECTIVE — assigns to individual / all team members / all dept members
// ─────────────────────────────────────────────────────────────
export async function createObjective(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");
  const objectiveLimit = await checkLimit(
  user.organizationId,
  "maxObjectives"
);

if (!objectiveLimit.allowed) {
  return {
    success: false,
    error: `You have reached the ${objectiveLimit.limit} objective limit on the ${objectiveLimit.plan} plan. Upgrade your plan to create more objectives.`,
  };
}

  const raw = {
    title:        (formData.get("title") as string)?.trim() ?? "",
    description:  (formData.get("description") as string)?.trim() || null,
    assignType:   formData.get("assignType") ?? "individual",
    ownerId:      (formData.get("ownerId") as string) || null,
    teamId:       (formData.get("teamId") as string) || null,
    departmentId: (formData.get("departmentId") as string) || null,
    quarter:      formData.get("quarter") ?? "",
    priority:     formData.get("priority") ?? "MEDIUM",
    startDate:    formData.get("startDate") ?? "",
    dueDate:      formData.get("dueDate") ?? "",
    keyResults:   JSON.parse((formData.get("keyResults") as string) || "[]"),
  };

  const parsed = CreateObjectiveSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const start = new Date(data.startDate);
  const due   = new Date(data.dueDate);
  if (due <= start) return { success: false, error: "Due date must be after start date" };

  // Determine who to assign to
  let ownerIds: string[] = [];

  if (data.assignType === "individual") {
    if (!data.ownerId) return { success: false, error: "Select an owner" };
    ownerIds = [data.ownerId];
  } else if (data.assignType === "team") {
    if (!data.teamId) return { success: false, error: "Select a team" };
    const teamMembers = await prisma.user.findMany({
      where:  { teamId: data.teamId, organizationId: user.organizationId, isActive: true },
      select: { id: true },
    });
    if (teamMembers.length === 0) return { success: false, error: "Selected team has no active members" };
    ownerIds = teamMembers.map(m => m.id);
  } else if (data.assignType === "department") {
    if (!data.departmentId) return { success: false, error: "Select a department" };
    const deptMembers = await prisma.user.findMany({
      where:  { departmentId: data.departmentId, organizationId: user.organizationId, isActive: true },
      select: { id: true },
    });
    if (deptMembers.length === 0) return { success: false, error: "Selected department has no active members" };
    ownerIds = deptMembers.map(m => m.id);
  }

 try {
    const createdIds: string[] = [];

    // ✅ Fetch owner details BEFORE transaction
    const ownerDetails = await prisma.user.findMany({
      where:  { id: { in: ownerIds } },
      select: { id: true, name: true, email: true },
    });
    const ownerMap = new Map(ownerDetails.map((o) => [o.id, o]));
    const scopeCheck = await validateManagerScope(user.id, user.organizationId, ownerIds);
    if (!scopeCheck.valid) return { success: false, error: scopeCheck.error! };
    await prisma.$transaction(
  async (tx) => {
      for (const ownerId of ownerIds) {
        const obj = await tx.objective.create({
          data: {
            title:          data.title,
            description:    data.description,
            ownerId,
            teamId:         data.teamId || null,
            quarter:        data.quarter,
            priority:       data.priority,
            startDate:      start,
            dueDate:        due,
            status:         "NOT_STARTED",
            progress:       0,
            organizationId: user.organizationId,
            createdById:    user.id,
            keyResults: {
              create: data.keyResults.map((kr) => ({
                title:          kr.title,
                targetValue:    kr.targetValue,
                currentValue:   0,
                startValue:     0,
                unit:           kr.unit || null,
                progress:       0,
                organizationId: user.organizationId,
              })),
            },
          },
        });

     
        createdIds.push(obj.id);

        // Notify each assignee (skip if self-assigning)
        if (ownerId !== user.id) {
          await tx.notification.create({
            data: {
              title:          "New OKR assigned",
              message:        `${user.name} assigned you: "${data.title}"`,
              type:           "OKR_ASSIGNED",
              userId:         ownerId,
              organizationId: user.organizationId,
              link:           `/objectives/${obj.id}`,
            },
          });
        }
      }

      await tx.activityLog.create({
        data: {
          action:         "created",
          entityType:     "Objective",
          entityId:       createdIds[0],
          userId:         user.id,
          organizationId: user.organizationId,
          metadata:       {
            title:      data.title,
            assignType: data.assignType,
            assignedTo: ownerIds.length,
          },
        },
      });
    },
   {
    timeout: 15000,
    maxWait: 10000,
  });

    // ✅ Send emails AFTER transaction — outside so failure never breaks OKR creation
    for (const ownerId of ownerIds) {
      if (ownerId === user.id) continue;

      const owner = ownerMap.get(ownerId);
      if (!owner) continue;

      sendOkrAssignedEmail({
        to:             owner.email,
        employeeName:   owner.name,
        assignerName:   user.name,
        objectiveTitle: data.title,
        objectiveId:    createdIds[0],
        quarter:        data.quarter,
        dueDate:        new Date(due).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
          
        }),
        priority: data.priority,
        organizationId: user.organizationId,
      }).catch((err) => console.error("OKR email failed:", err));
    }

    revalidatePath("/objectives");

    const msg = ownerIds.length > 1
      ? `Objective created and assigned to ${ownerIds.length} members`
      : "Objective created successfully";

    return { success: true, message: msg, id: createdIds[0] };

  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to create objective" };
  }
}
// ─────────────────────────────────────────────────────────────
// LOG KEY RESULT PROGRESS
// ─────────────────────────────────────────────────────────────
const LogProgressSchema = z.object({
  keyResultId: z.string(),
  value:       z.coerce.number().min(0),
  note:        z.string().optional(),
});

export async function logKeyResultProgress(formData: FormData): Promise<ActionResult> {
  const user   = await getCurrentUser();
  const parsed = LogProgressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { keyResultId, value, note } = parsed.data;

  const kr = await prisma.keyResult.findFirst({
    where:   { id: keyResultId, organizationId: user.organizationId },
    include: {
      objective: {
        select: {
          id: true, ownerId: true, organizationId: true,
          keyResults: { select: { progress: true } },
        },
      },
    },
  });
  if (!kr) return { success: false, error: "Key result not found" };

  const isOwner       = kr.objective.ownerId === user.id;
  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(user.role);
  if (!isOwner && !isManagerPlus) return { success: false, error: "Permission denied" };

  const newProgress = kr.targetValue > 0
    ? Math.min(Math.round((value / kr.targetValue) * 100), 100)
    : 0;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.keyResult.update({
        where: { id: keyResultId },
        data:  { currentValue: value, progress: newProgress },
      });

      await tx.keyResultLog.create({
        data: { keyResultId, value, note, userId: user.id },
      });

      const allKRs = await tx.keyResult.findMany({
        where:  { objectiveId: kr.objective.id },
        select: { progress: true },
      });
      const avgProgress = Math.round(
        allKRs.reduce((a, k) => a + k.progress, 0) / allKRs.length
      );

      const objective = await tx.objective.findUnique({
        where:  { id: kr.objective.id },
        select: { dueDate: true, status: true },
      });

      let newStatus = "NOT_STARTED";
      if (avgProgress >= 100) {
        newStatus = "COMPLETED";
      } else if (avgProgress > 0) {
        const daysLeft = objective
          ? Math.ceil((new Date(objective.dueDate).getTime() - Date.now()) / 86400000)
          : 99;
        if (daysLeft < 0) newStatus = "BEHIND";
        else if (avgProgress < 30 && daysLeft < 14) newStatus = "AT_RISK";
        else newStatus = "ON_TRACK";
      }

      await tx.objective.update({
        where: { id: kr.objective.id },
        data:  { progress: avgProgress, status: newStatus as any },
      });

      await tx.activityLog.create({
        data: {
          action:         "updated progress on",
          entityType:     "KeyResult",
          entityId:       keyResultId,
          userId:         user.id,
          organizationId: user.organizationId,
          metadata:       { value, progress: newProgress },
        },
      });
    });

    revalidatePath(`/objectives/${kr.objective.id}`);
    revalidatePath("/objectives");
    revalidatePath("/dashboard");
    return { success: true, message: "Progress updated" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to update progress" };
  }
}

// ─────────────────────────────────────────────────────────────
// ADD COMMENT
// ─────────────────────────────────────────────────────────────
export async function addComment(objectiveId: string, content: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!content.trim()) return { success: false, error: "Comment cannot be empty" };

  const obj = await prisma.objective.findFirst({
    where:  { id: objectiveId, organizationId: user.organizationId },
    select: { id: true, ownerId: true },
  });
  if (!obj) return { success: false, error: "Objective not found" };

  await prisma.comment.create({
    data: { content: content.trim(), userId: user.id, objectiveId },
  });

  if (obj.ownerId !== user.id) {
    await prisma.notification.create({
      data: {
        title:          "New comment on your OKR",
        message:        `${user.name} commented on your objective`,
        type:           "COMMENT_ADDED",
        userId:         obj.ownerId,
        organizationId: user.organizationId,
        link:           `/objectives/${objectiveId}`,
      },
    });
  }

  revalidatePath(`/objectives/${objectiveId}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// UPDATE STATUS
// ─────────────────────────────────────────────────────────────
const STATUS_VALUES = ["NOT_STARTED", "ON_TRACK", "AT_RISK", "BEHIND", "COMPLETED"] as const;

export async function updateObjectiveStatus(
  objectiveId: string,
  status: typeof STATUS_VALUES[number]
): Promise<ActionResult> {
  const user = await getCurrentUser();

  const obj = await prisma.objective.findFirst({
    where:  { id: objectiveId, organizationId: user.organizationId },
    select: { ownerId: true },
  });
  if (!obj) return { success: false, error: "Objective not found" };

  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(user.role);
  if (!isManagerPlus && obj.ownerId !== user.id) {
    return { success: false, error: "Permission denied" };
  }

  await prisma.objective.update({ where: { id: objectiveId }, data: { status } });
  revalidatePath(`/objectives/${objectiveId}`);
  revalidatePath("/objectives");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────
export async function deleteObjective(objectiveId: string): Promise<ActionResult> {
  const user = await getCurrentUser();

  const obj = await prisma.objective.findFirst({
    where:  { id: objectiveId, organizationId: user.organizationId },
    select: { createdById: true, title: true },
  });
  if (!obj) return { success: false, error: "Objective not found" };

  const isManagerPlus = ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(user.role);
  if (!isManagerPlus && obj.createdById !== user.id) {
    return { success: false, error: "Permission denied" };
  }

  await prisma.objective.delete({ where: { id: objectiveId } });

  await prisma.activityLog.create({
    data: {
      action: "deleted", entityType: "Objective", entityId: objectiveId,
      userId: user.id, organizationId: user.organizationId,
      metadata: { title: obj.title },
    },
  });

  revalidatePath("/objectives");
  return { success: true, message: "Objective deleted" };
}