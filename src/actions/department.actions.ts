// "use server";
// import { prisma }          from "@/lib/prisma";
// import { getCurrentUser, requireRole } from "@/lib/auth";
// import { revalidatePath }  from "next/cache";
// import { z }               from "zod";

// export type ActionResult =
//   | { success: true;  message?: string; id?: string }
//   | { success: false; error: string };

// const DepartmentSchema = z.object({
//   name:   z.string().min(2, "Name must be at least 2 characters"),
//   headId: z.string().optional().nullable(),
// });

// // ── 1. GET ALL DEPARTMENTS ────────────────────────────────────
// export async function getDepartments(organizationId: string) {
//   return prisma.department.findMany({
//     where:   { organizationId },
//     orderBy: { name: "asc" },
//     select: {
//       id:        true,
//       name:      true,
//       createdAt: true,
//       headId:    true,
//       _count:    { select: { users: true } },
//       users: {
//         take:   5,
//         select: { id: true, name: true, avatar: true, role: true },
//       },
//     },
//   });
// }

// export type DepartmentListItem = Awaited<ReturnType<typeof getDepartments>>[number];

// // ── 2. GET SINGLE DEPARTMENT ──────────────────────────────────
// export async function getDepartmentById(id: string, organizationId: string) {
//   return prisma.department.findFirst({
//     where:   { id, organizationId },
//     include: {
//       users: {
//         orderBy: { joinedAt: "desc" },
//         select: {
//           id: true, name: true, email: true,
//           avatar: true, role: true, designation: true,
//           isActive: true, joinedAt: true,
//           _count: { select: { objectives: true } },
//         },
//       },
//     },
//   });
// }

// export type DepartmentDetail = Awaited<ReturnType<typeof getDepartmentById>>;

// // ── 3. GET MANAGERS — for head dropdown ──────────────────────
// export async function getDepartmentFormData(organizationId: string) {
//   const managers = await prisma.user.findMany({
//     where:   { organizationId, isActive: true, role: { in: ["MANAGER", "HR", "ORG_ADMIN"] } },
//     select:  { id: true, name: true, role: true, avatar: true },
//     orderBy: { name: "asc" },
//   });
//   return { managers };
// }

// // ── 4. CREATE DEPARTMENT ──────────────────────────────────────
// export async function createDepartment(formData: FormData): Promise<ActionResult> {
//   const user = await getCurrentUser();
//   requireRole(user.role, "ORG_ADMIN");

//   const parsed = DepartmentSchema.safeParse({
//     name:   formData.get("name") ?? "",
//     headId: (formData.get("headId") as string) || null,
//   });
//   if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

//   const { name, headId } = parsed.data;

//   // Check duplicate name in org
//   const existing = await prisma.department.findFirst({
//     where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId },
//   });
//   if (existing) return { success: false, error: "Department with this name already exists" };

//   const dept = await prisma.$transaction(async (tx) => {
//     const dept = await tx.department.create({
//       data: {
//         name,
//         headId:         headId ?? null,
//         organizationId: user.organizationId,
//       },
//     });

//     await tx.activityLog.create({
//       data: {
//         action:         "created",
//         entityType:     "Department",
//         entityId:       dept.id,
//         userId:         user.id,
//         organizationId: user.organizationId,
//         metadata:       { name },
//       },
//     });

//     return dept;
//   });

//   revalidatePath("/departments");
//   return { success: true, message: "Department created", id: dept.id };
// }

// // ── 5. EDIT DEPARTMENT ────────────────────────────────────────
// export async function editDepartment(
//   id: string,
//   formData: FormData
// ): Promise<ActionResult> {
//   const user = await getCurrentUser();
//   requireRole(user.role, "ORG_ADMIN");

//   const parsed = DepartmentSchema.safeParse({
//     name:   formData.get("name") ?? "",
//     headId: (formData.get("headId") as string) || null,
//   });
//   if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

//   const { name, headId } = parsed.data;

//   const dept = await prisma.department.findFirst({
//     where: { id, organizationId: user.organizationId },
//   });
//   if (!dept) return { success: false, error: "Department not found" };

//   // Check duplicate name (excluding self)
//   const duplicate = await prisma.department.findFirst({
//     where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId, NOT: { id } },
//   });
//   if (duplicate) return { success: false, error: "Department with this name already exists" };

//   await prisma.department.update({
//     where: { id },
//     data:  { name, headId: headId ?? null },
//   });

//   revalidatePath("/departments");
//   revalidatePath(`/departments/${id}`);
//   return { success: true, message: "Department updated" };
// }

// // ── 6. DELETE DEPARTMENT ──────────────────────────────────────
// export async function deleteDepartment(id: string): Promise<ActionResult> {
//   const user = await getCurrentUser();
//   requireRole(user.role, "ORG_ADMIN");

//   const dept = await prisma.department.findFirst({
//     where:   { id, organizationId: user.organizationId },
//     include: { _count: { select: { users: true } } },
//   });
//   if (!dept) return { success: false, error: "Department not found" };

//   if (dept._count.users > 0) {
//     return { success: false, error: `Cannot delete — ${dept._count.users} members are in this department. Reassign them first.` };
//   }

//   await prisma.department.delete({ where: { id } });

//   revalidatePath("/departments");
//   return { success: true, message: "Department deleted" };
// }

// // ── 7. ASSIGN HEAD ────────────────────────────────────────────
// export async function assignDepartmentHead(
//   deptId: string,
//   headId: string | null
// ): Promise<ActionResult> {
//   const user = await getCurrentUser();
//   requireRole(user.role, "ORG_ADMIN");

//   const dept = await prisma.department.findFirst({
//     where: { id: deptId, organizationId: user.organizationId },
//   });
//   if (!dept) return { success: false, error: "Department not found" };

//   await prisma.department.update({
//     where: { id: deptId },
//     data:  { headId },
//   });

//   revalidatePath("/departments");
//   revalidatePath(`/departments/${deptId}`);
//   return { success: true, message: headId ? "Head assigned" : "Head removed" };
// }

// src/actions/department.actions.ts
"use server";

import { prisma }          from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { revalidatePath }  from "next/cache";
import { z }               from "zod";
import { checkLimit } from "@/actions/subscription.actions";

export type ActionResult =
  | { success: true;  message?: string; id?: string }
  | { success: false; error: string };

const DepartmentSchema = z.object({
  name:   z.string().min(2, "Name must be at least 2 characters"),
  headId: z.string().optional().nullable(),
});

// ── 1. GET ALL DEPARTMENTS ────────────────────────────────────
export async function getDepartments(organizationId: string) {
  return prisma.department.findMany({
    where:   { organizationId },
    orderBy: { name: "asc" },
    select: {
      id:        true,
      name:      true,
      createdAt: true,
      headId:    true,
      _count:    { select: { users: true } },
      users: {
        take:   5,
        select: { id: true, name: true, avatar: true, role: true },
      },
    },
  });
}

export type DepartmentListItem = Awaited<ReturnType<typeof getDepartments>>[number];

// ── 2. GET SINGLE DEPARTMENT ──────────────────────────────────
export async function getDepartmentById(id: string, organizationId: string) {
  return prisma.department.findFirst({
    where:   { id, organizationId },
    include: {
      users: {
        orderBy: { joinedAt: "desc" },
        select: {
          id: true, name: true, email: true,
          avatar: true, role: true, designation: true,
          isActive: true, joinedAt: true,
          _count: { select: { objectives: true } },
        },
      },
    },
  });
}

export type DepartmentDetail = Awaited<ReturnType<typeof getDepartmentById>>;

// ── 3. GET MANAGERS — for head dropdown ──────────────────────
export async function getDepartmentFormData(organizationId: string) {
  const [managers, allEmployees] = await Promise.all([
    prisma.user.findMany({
      where:   { organizationId, isActive: true, role: { in: ["MANAGER", "HR", "ORG_ADMIN"] } },
      select:  { id: true, name: true, role: true, avatar: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where:   { organizationId, isActive: true, role: { not: "SUPER_ADMIN" },  },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, designation: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        team:       { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);
  return { managers, allEmployees };
}

export type DeptFormData = Awaited<ReturnType<typeof getDepartmentFormData>>;
// ── 4. CREATE DEPARTMENT ──────────────────────────────────────
export async function createDepartment(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const parsed = DepartmentSchema.safeParse({
    name:   formData.get("name") ?? "",
    headId: (formData.get("headId") as string) || null,
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { name, headId } = parsed.data;
  const memberIds = JSON.parse(
    (formData.get("memberIds") as string) || "[]"
) as string[];
  
  // Check duplicate name in org
  const existing = await prisma.department.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId },
  });
  if (existing) return { success: false, error: "Department with this name already exists" };
    
   const limit = await checkLimit(
    user.organizationId,
    "maxDepartments"
);

if (!limit.allowed) {
    return {
        success: false,
        error: `Department limit reached (${limit.current}/${limit.limit}). Upgrade your plan.`,
    };
}


  const dept = await prisma.$transaction(async (tx) => {
    const dept = await tx.department.create({
      data: {
        name,
        headId:         headId ?? null,
        organizationId: user.organizationId,
      },
    });


    if (memberIds.length > 0) {
    await tx.user.updateMany({
        where: {
            id: {
                in: memberIds,
            },
            organizationId: user.organizationId,
        },
        data: {
            departmentId: dept.id,
        },
    });
}

    await tx.activityLog.create({
      data: {
        action:         "created",
        entityType:     "Department",
        entityId:       dept.id,
        userId:         user.id,
        organizationId: user.organizationId,
        metadata:       { name },
      },
    });

    return dept;
  });

  revalidatePath("/departments");
  return { success: true, message: "Department created", id: dept.id };
}

// ── 5. EDIT DEPARTMENT ────────────────────────────────────────
export async function editDepartment(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const parsed = DepartmentSchema.safeParse({
    name:   formData.get("name") ?? "",
    headId: (formData.get("headId") as string) || null,
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { name, headId } = parsed.data;
  const memberIds = JSON.parse(
    (formData.get("memberIds") as string) || "[]"
);

  // const dept = await prisma.department.findFirst({
  //   where: { id, organizationId: user.organizationId },
  // });



  // if (!dept) return { success: false, error: "Department not found" };

  // Check duplicate name (excluding self)
  const duplicate = await prisma.department.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId, NOT: { id } },
  });
  if (duplicate) return { success: false, error: "Department with this name already exists" };
       await prisma.$transaction(async (tx) => {
  // Update department details
  await tx.department.update({
    where: { id },
    data: {
      name,
      headId: headId ?? null,
    },
  });

  // Remove all existing department members
  await tx.user.updateMany({
    where: {
      departmentId: id,
      organizationId: user.organizationId,
    },
    data: {
      departmentId: null,
    },
  });

  // Assign newly selected members
  if (memberIds.length > 0) {
    await tx.user.updateMany({
      where: {
        id: {
          in: memberIds,
        },
        organizationId: user.organizationId,
      },
      data: {
        departmentId: id,
      },
    });
  }
});

  await prisma.department.update({
    where: { id },
    data:  { name, headId: headId ?? null },
  });

  revalidatePath("/departments");
  revalidatePath(`/departments/${id}`);
  return { success: true, message: "Department updated" };
}

// ── 6. DELETE DEPARTMENT ──────────────────────────────────────
export async function deleteDepartment(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const dept = await prisma.department.findFirst({
    where:   { id, organizationId: user.organizationId },
    include: { _count: { select: { users: true } } },
  });
  if (!dept) return { success: false, error: "Department not found" };

  if (dept._count.users > 0) {
    return { success: false, error: `Cannot delete — ${dept._count.users} members are in this department. Reassign them first.` };
  }

  await prisma.department.delete({ where: { id } });

  revalidatePath("/departments");
  return { success: true, message: "Department deleted" };
}

// ── 7. ASSIGN HEAD ────────────────────────────────────────────
export async function assignDepartmentHead(
  deptId: string,
  headId: string | null
): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const dept = await prisma.department.findFirst({
    where: { id: deptId, organizationId: user.organizationId },
  });
  if (!dept) return { success: false, error: "Department not found" };

  await prisma.department.update({
    where: { id: deptId },
    data:  { headId },
  });

  revalidatePath("/departments");
  revalidatePath(`/departments/${deptId}`);
  return { success: true, message: headId ? "Head assigned" : "Head removed" };
}