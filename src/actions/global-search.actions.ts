"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function globalSearch(query: string) {
  const user = await getCurrentUser();

  const q = query.trim();

  if (!q) {
    return {
      employees: [],
      objectives: [],
      teams: [],
      departments: [],
    };
  }

  const [employees, objectives, teams, departments] =
    await Promise.all([
      prisma.user.findMany({
        where: {
          organizationId: user.organizationId,
          isActive: true,
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              employeeId: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              designation: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          designation: true,
        },
        take: 5,
      }),

      prisma.objective.findMany({
        where: {
          organizationId: user.organizationId,
          title: {
            contains: q,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          title: true,
        },
        take: 5,
      }),

      prisma.team.findMany({
        where: {
          organizationId: user.organizationId,
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
        },
        take: 5,
      }),

      prisma.department.findMany({
        where: {
          organizationId: user.organizationId,
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
        },
        take: 5,
      }),
    ]);

  return {
    employees,
    objectives,
    teams,
    departments,
  };
}