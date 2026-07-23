// // lib/auth.ts
// import { getSession } from "@/lib/session";
// import { prisma }     from "@/lib/prisma";
// import { redirect }   from "next/navigation";

// import { Role } from "@/generated/prisma/enums";

// export type SafeUser = Awaited<ReturnType<typeof getCurrentUser>>;

// export async function getCurrentUser() {
//   const session = await getSession();
//   if (!session) redirect("/sign-in");

//   const user = await prisma.user.findUnique({
//     where: { id: session.userId },
//     include: {
//       organization: { include: { subscriptions: true } },
//       department:   true,
//       team:         true,
//       preferences:  true,
//     },
//   });

//   if (!user || !user.isActive) redirect("/sign-in");
//   return user;
// }

// const HIERARCHY: Role[] = [
//   "EMPLOYEE",
//   "MANAGER",
//   "HR",
//   "ORG_ADMIN",
//   "SUPER_ADMIN",
// ];

// export function requireRole(userRole: Role, minRole: Role): void {
//   if (HIERARCHY.indexOf(userRole) < HIERARCHY.indexOf(minRole)) {
//     redirect("/dashboard");
//   }
// }

// export const isSuperAdmin = (r: Role) => r === "SUPER_ADMIN";
// export const isOrgAdmin   = (r: Role) => ["ORG_ADMIN","SUPER_ADMIN"].includes(r);
// export const isHR         = (r: Role) => ["HR","ORG_ADMIN","SUPER_ADMIN"].includes(r);
// export const isManager    = (r: Role) => ["MANAGER","HR","ORG_ADMIN","SUPER_ADMIN"].includes(r);


// lib/auth.ts
import { getSession } from "@/lib/session";
import { prisma }     from "@/lib/prisma";
import { redirect }   from "next/navigation";
import { Role }       from "@/generated/prisma/enums";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { id: session.userId },
    select: {
      id:             true,
      name:           true,
      email:          true,
      role:           true,
      isActive:       true,
      avatar:         true,
      organizationId: true,
      departmentId:   true,
      teamId:         true,
      organization: {
        select: {
          id:   true,
          name: true,
          logo: true,
          slug: true,
          subscriptions: {
            select: { plan: true, active: true },
            take:   1,
          },
        },
      },
      preferences: {
        select: { theme: true, emailNotifications: true },
      },
    },
  });

  if (!user || !user.isActive) redirect("/sign-in");
  return user;
}

export type SafeUser = Awaited<ReturnType<typeof getCurrentUser>>;

// ── Role hierarchy ────────────────────────────────────────────
const HIERARCHY: Role[] = [
  "EMPLOYEE",
  "MANAGER",
  "HR",
  "ORG_ADMIN",
  "SUPER_ADMIN",
];

export function requireRole(userRole: Role, minRole: Role): void {
  if (HIERARCHY.indexOf(userRole) < HIERARCHY.indexOf(minRole)) {
    redirect("/dashboard");
  }
}

export const isSuperAdmin = (r: Role) => r === "SUPER_ADMIN";
export const isOrgAdmin   = (r: Role) => ["ORG_ADMIN", "SUPER_ADMIN"].includes(r);
export const isHR         = (r: Role) => ["HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(r);
export const isManager    = (r: Role) => ["MANAGER", "HR", "ORG_ADMIN", "SUPER_ADMIN"].includes(r);