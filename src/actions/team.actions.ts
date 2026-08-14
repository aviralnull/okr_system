'use server'
import {prisma} from  "@/lib/prisma"
import { getCurrentUser , requireRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {z} from "zod"
import { checkLimit } from "@/actions/subscription.actions";
export type ActionResult = |{success :true ;message?:string ; id?:string}|{success:false ; error:string}
// export  async  function getTeams(organizationId :string) {
//     return prisma.team.findMany({
//         where : {organizationId} ,
//         orderBy : {name: "asc"} ,
//         select : {id:true , name:true ,description:true , leadId :true , createdAt: true , _count: {select : {users: true , objectives:true}} ,
//         users : {
//             take:5  ,
//             select:{id:true ,name:true ,avatar:true , role:true} ,
//         },
//     } ,
//     }) ;

// }
  export async function getTeams(
  organizationId: string,
  userId: string,
  role: string,
  departmentId?: string // currently unused until Team has departmentId
) {
  const isManager = role === "MANAGER";

  // Managers only see teams they belong to
  if (isManager) {
    return prisma.team.findMany({
      where: {
        organizationId,
        users: {
          some: {
            id: userId,
          },
        },
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        description: true,
        departmentId: true,
        leadId: true,
        createdAt: true,

        lead: {
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
    },
  },

        users: {
          // take: 5,
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },

        _count: {
          select: {
            users: true,
            objectives: true,
          },
        },
      },
    });
  }

  // Org Admin / HR / Super Admin
  return prisma.team.findMany({
    where: {
      organizationId,
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      description: true,
      departmentId: true,
      leadId: true,
      createdAt: true,

      lead: {
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
    },
  },

      users: {
        // take: 5,
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
        },
      },

      _count: {
        select: {
          users: true,
          objectives: true,
        },
      },
    },
  });
}



// export async function getTeams(
//   organizationId: string,
//   userId: string,
//   role: string,
//   departmentId?: string   // ← new filter param
// ) {
//   const isOrgAdmin = ["ORG_ADMIN", "SUPER_ADMIN", "HR"].includes(role);
//   const isManager  = role === "MANAGER";

//   // Manager sees only their dept's teams
//   if (isManager) {
//     const manager = await prisma.user.findUnique({
//       where:  { id: userId },
//       select: { departmentId: true },
//     });

//     return prisma.team.findMany({
//       where: {
//         organizationId,
//         // Manager restricted to their dept
//         ...(manager?.departmentId
//           ? { departmentId: manager.departmentId }
//           : { users: { some: { id: userId } } }
//         ),
//         // Apply additional dept filter if provided
//         ...(departmentId ? { departmentId } : {}),
//       },
//       // include: {
//       //   _count: { select: { users: true } },
//       //   head:   { select: { name: true, avatar: true } },
//       //   department: { select: { name: true } },
//       // }
//       include: {
//   users: {
//     select: {
//       id: true,
//       name: true,
//       avatar: true,
//       role: true,
//     },
//   },

//   _count: {
//     select: {
//       users: true,
//       objectives: true,
//     },
//   },

//   head: {
//     select: {
//       name: true,
//       avatar: true,
//     },
//   },

//   department: {
//     select: {
//       name: true,
//     },
//   },
// },
//       orderBy: { name: "asc" },
//     });
//   }

//   // Org admin — all teams, with optional dept filter
//   return prisma.team.findMany({
//     where: {
//       organizationId,
//       ...(departmentId ? { departmentId } : {}),
//     },
//     // include: {
//     //   _count:     { select: { users: true } },
//     //   head:       { select: { name: true, avatar: true } },
//     //   department: { select: { name: true } },
//     // }
//     include: {
//   users: {
//     select: {
//       id: true,
//       name: true,
//       avatar: true,
//       role: true,
//     },
//   },

//   _count: {
//     select: {
//       users: true,
//       objectives: true,
//     },
//   },

//   head: {
//     select: {
//       name: true,
//       avatar: true,
//     },
//   },

//   department: {
//     select: {
//       name: true,
//     },
//   },
// },
//     orderBy: { name: "asc" },
//   });
// }

// Multi-team assignment for employee
// export async function assignUserToTeams(
//   userId: string,
//   teamIds: string[]
// ): Promise<ActionResult> {
//   const viewer = await getCurrentUser();
//   requireRole(viewer.role, "ORG_ADMIN");

//   const user = await prisma.user.findFirst({
//     where: { id: userId, organizationId: viewer.organizationId },
//   });
//   if (!user) return { success: false, error: "User not found" };

//   // Upsert all team assignments
//   await prisma.$transaction([
//     // Remove old assignments
//     prisma.userTeam.deleteMany({ where: { userId } }),
//     // Add new assignments
//     ...teamIds.map(teamId =>
//       prisma.userTeam.create({ data: { userId, teamId } })
//     ),
//   ]);

//   // Update primary team (first one)
//   if (teamIds.length > 0) {
//     await prisma.user.update({
//       where: { id: userId },
//       data:  { teamId: teamIds[0] },
//     });
//   }

//   revalidatePath("/employees");
//   revalidatePath("/teams");
//   return { success: true, message: "Team assignments updated" };
// }

// Multi-department assignment for employee
// export async function assignUserToDepartments(
//   userId: string,
//   departmentIds: string[]
// ): Promise<ActionResult> {
//   const viewer = await getCurrentUser();
//   requireRole(viewer.role, "ORG_ADMIN");

//   const user = await prisma.user.findFirst({
//     where: { id: userId, organizationId: viewer.organizationId },
//   });
//   if (!user) return { success: false, error: "User not found" };

//   await prisma.$transaction([
//     prisma.userDepartment.deleteMany({ where: { userId } }),
//     ...departmentIds.map(departmentId =>
//       prisma.userDepartment.create({ data: { userId, departmentId } })
//     ),
//   ]);

//   if (departmentIds.length > 0) {
//     await prisma.user.update({
//       where: { id: userId },
//       data:  { departmentId: departmentIds[0] },
//     });
//   }

//   revalidatePath("/employees");
//   revalidatePath("/departments");
//   return { success: true, message: "Department assignments updated" };
// }


export type TeamListItem = Awaited<ReturnType<typeof getTeams>>[number] ;


export async function getTeamById(id:string ,organizationId:string) {
    return prisma.team.findFirst({
        where: {id ,organizationId} ,
        include :{ 

           lead: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
        },
      },

      
            users: {
                orderBy : {joinedAt:"desc"} ,
                select :{
                    id: true ,name:true ,email:true , avatar:true ,role:true ,designation:true , isActive:true , joinedAt:true ,
                    department :{select : {name:true}} ,
                    _count : {select: {objectives:true}} ,

                } ,

            } ,
            objectives: {
                orderBy : {createdAt: "desc"} ,
                take:5 ,
                select : {
                    id : true ,title:true ,progress:true ,status:true , quarter:true ,
                    owner : {select : {name:true , avatar:true ,}} ,

                } ,
            } ,
        }
    }) ;
}
export  type  TeamDetail = Awaited<ReturnType<typeof getTeamById>> ;
// export async  function getTeamFormData(organizationId:string){
//     const [leads , allEmployees] = await Promise.all([
//         prisma.user.findMany({
//             where: {organizationId , isActive:true ,role : {in:["MANAGER" , "HR" ,"ORG_ADMIN"]}} ,
//             select : {id:true ,name:true ,role:true ,avatar:true} ,
//             orderBy : {name: "asc"} ,

//         }) ,
//         prisma.user.findMany({
//             where : {organizationId, isActive:true , role: {not : "SUPER_ADMIN"}} ,
//             select : {
//                 id:true ,   name :true ,   email:true ,role:true ,avatar:true   ,designation:true , team: {select:{id : true ,name:true}} ,
                
//             } ,
//             orderBy: {name: "asc"} ,
//         }) ,
//     ]) ;
//     return {leads ,allEmployees} ;
// }
export async function getTeamFormData(organizationId: string) {
  const [leads, allEmployees, departments] = await Promise.all([
    prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
        // role: { in: ["MANAGER", "HR", "ORG_ADMIN"] },
        role: {
      not: "SUPER_ADMIN",
    },
      },
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        departmentId: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
        role: { not: "SUPER_ADMIN" },
        teamId: null, // Only unassigned employees
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        designation: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.department.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    leads,
    allEmployees,
    departments,
  };
}
export type TeamFormData = Awaited<ReturnType<typeof getTeamFormData>> ;


// // ── CREATE ────────────────────────────────────────────────────
// export async function createTeam(formData: FormData): Promise<ActionResult> {
//   const user = await getCurrentUser();
//   requireRole(user.role, "MANAGER");

//   const name        = (formData.get("name") as string)?.trim() ?? "";
//   const description = (formData.get("description") as string)?.trim() || null;
//   const leadId      = (formData.get("leadId") as string) || null;
//   const memberIds   = JSON.parse((formData.get("memberIds") as string) || "[]") as string[];

//   if (!name || name.length < 2) return { success: false, error: "Team name must be at least 2 characters" };

//   const existing = await prisma.team.findFirst({
//     where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId },
//   });
//   if (existing) return { success: false, error: "Team with this name already exists" };

//   const team = await prisma.$transaction(async (tx) => {
//     const team = await tx.team.create({
//       data: {
//         name,
//         description,
//         leadId:         leadId ?? null,
//         organizationId: user.organizationId,
//       },
//     });

//     // Assign members
//     if (memberIds.length > 0) {
//       await tx.user.updateMany({
//         where: { id: { in: memberIds }, organizationId: user.organizationId },
//         data:  { teamId: team.id },
//       });
//     }

//     await tx.activityLog.create({
//       data: {
//         action: "created", entityType: "Team", entityId: team.id,
//         userId: user.id, organizationId: user.organizationId,
//         metadata: { name, memberCount: memberIds.length },
//       },
//     });

//     return team;
//   });

//   revalidatePath("/teams");
//   revalidatePath("/employees");
//   return { success: true, message: `Team created with ${memberIds.length} members`, id: team.id };
// }





// // ── EDIT ──────────────────────────────────────────────────────
// export async function editTeam(id: string, formData: FormData): Promise<ActionResult> {
//   const user = await getCurrentUser();
//   requireRole(user.role, "MANAGER");

//   const name        = (formData.get("name") as string)?.trim() ?? "";
//   const description = (formData.get("description") as string)?.trim() || null;
//   const leadId      = (formData.get("leadId") as string) || null;
//   const memberIds   = JSON.parse((formData.get("memberIds") as string) || "[]") as string[];

//   if (!name || name.length < 2) return { success: false, error: "Team name must be at least 2 characters" };

//   const team = await prisma.team.findFirst({
//     where: { id, organizationId: user.organizationId },
//   });
//   if (!team) return { success: false, error: "Team not found" };

//   const duplicate = await prisma.team.findFirst({
//     where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId, NOT: { id } },
//   });
//   if (duplicate) return { success: false, error: "Team with this name already exists" };

//   await prisma.$transaction(async (tx) => {
//     await tx.team.update({
//       where: { id },
//       data:  { name, description, leadId: leadId ?? null },
//     });

//     // Remove all current members, reassign selected
//     await tx.user.updateMany({
//       where: { teamId: id, organizationId: user.organizationId },
//       data:  { teamId: null },
//     });
//     if (memberIds.length > 0) {
//       await tx.user.updateMany({
//         where: { id: { in: memberIds }, organizationId: user.organizationId },
//         data:  { teamId: id },
//       });
//     }
//   });

//   revalidatePath("/teams");
//   revalidatePath(`/teams/${id}`);
//   revalidatePath("/employees");
//   return { success: true, message: "Team updated" };
// }









// Replace createTeam and editTeam in src/actions/team.actions.ts

// ── CREATE ────────────────────────────────────────────────────
export async function createTeam(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const name         = (formData.get("name") as string)?.trim() ?? "";
  const description  = (formData.get("description") as string)?.trim() || null;
  const leadId       = (formData.get("leadId") as string) || null;
  const departmentId = (formData.get("departmentId") as string) ; // ✅ ADD
  const memberIds    = JSON.parse((formData.get("memberIds") as string) || "[]") as string[];
  

if (!departmentId) {
  return {
    success: false,
    error: "Department is required",
  };
}

if (leadId) {
  const lead = await prisma.user.findFirst({
    where: {
      id: leadId,
      organizationId: user.organizationId,
      isActive: true,
      role: {
  not: "SUPER_ADMIN",
},
    },
    select: {
      id: true,
      departmentId: true,
       teamId: true,
    },
  });

  if (!lead) {
    return {
      success: false,
      error: "Invalid team lead",
    };
  }


  if (lead.departmentId !== departmentId) {
    return {
      success: false,
      error: "Team lead must belong to the same department as the team",
    };
  }
  if (lead.teamId) {
    return {
      success: false,
      error: "This team lead is already assigned to another team",
    };
  }
}
  if (!name || name.length < 2) return { success: false, error: "Team name must be at least 2 characters" };

  const existing = await prisma.team.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId },
  });
  if (existing) return { success: false, error: "Team with this name already exists" };
 const limit = await checkLimit(
    user.organizationId,
    "maxTeams"
);

if (!limit.allowed) {
    return {
        success: false,
        error: `Team limit reached (${limit.current}/${limit.limit}). Upgrade your plan.`,
    };
}
     
 const selectedMembers = await prisma.user.findMany({
  where: {
    id: {
      in: memberIds,
    },
    organizationId: user.organizationId,
    isActive: true,
  },
  select: {
    id: true,
    teamId: true,
    departmentId: true,
  },
});

if (selectedMembers.length !== memberIds.length) {
  return {
    success: false,
    error: "One or more selected employees are invalid.",
  };
}

const alreadyAssigned = selectedMembers.find(
  member => member.teamId !== null
);

if (alreadyAssigned) {
  return {
    success: false,
    error: "One or more selected employees are already assigned to another team.",
  };
}


const wrongDepartmentMember = selectedMembers.find(
  member =>
    member.departmentId !== departmentId
);

if (wrongDepartmentMember) {
  return {
    success: false,
    error: "All team members must belong to the same department as the team.",
  };
}


  const team = await prisma.$transaction(async (tx) => {
    // const team = await tx.team.create({
    //   data: {
    //     name,
    //     description,
    //     leadId:         leadId       ?? null,
    //     departmentId:   departmentId, // ✅ ADD
    //     organizationId: user.organizationId,
    //   },
    // });

    // if (memberIds.length > 0) {
    //   await tx.user.updateMany({
    //     where: { id: { in: memberIds }, organizationId: user.organizationId },
    //     data:  { teamId: team.id },
    //   });
    // }


    const finalMemberIds = Array.from(
  new Set([
    ...memberIds,
    ...(leadId ? [leadId] : []),
  ])
);

const team = await tx.team.create({
  data: {
    name,
    description,
    leadId: leadId ?? null,
    departmentId,
    organizationId: user.organizationId,
  },
});

if (finalMemberIds.length > 0) {
  await tx.user.updateMany({
    where: {
      id: { in: finalMemberIds },
      organizationId: user.organizationId,
      teamId: null,
    },
    data: {
      teamId: team.id,
    },
  });
}
    await tx.activityLog.create({
      data: {
        action: "created", entityType: "Team", entityId: team.id,
        userId: user.id, organizationId: user.organizationId,
        metadata: { name, memberCount: memberIds.length },
      },
    });

    return team;
  });

  revalidatePath("/teams");
  revalidatePath("/employees");
  return { success: true, message: `Team created with ${memberIds.length} members`, id: team.id };
}

// ── EDIT ──────────────────────────────────────────────────────
export async function editTeam(id: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const name         = (formData.get("name") as string)?.trim() ?? "";
  const description  = (formData.get("description") as string)?.trim() || null;
  const leadId       = (formData.get("leadId") as string) || null;
  const departmentId = (formData.get("departmentId") as string) ; // ✅ ADD
  const memberIds    = JSON.parse((formData.get("memberIds") as string) || "[]") as string[];
  const finalMemberIds = Array.from(
  new Set([
    ...memberIds,
    ...(leadId ? [leadId] : []),
  ])
);
 if (!departmentId) {
  return {
    success: false,
    error: "Department is required.",
  };
} 

if (leadId) {
  const lead = await prisma.user.findFirst({
    where: {
      id: leadId,
      organizationId: user.organizationId,
      isActive: true,
     role: {
  not: "SUPER_ADMIN",
},
    },
    select: {
      id: true,
      departmentId: true,
       teamId: true,
    },
  });

  if (!lead) {
    return {
      success: false,
      error: "Invalid team lead",
    };
  }

  if (lead.departmentId !== departmentId) {
    return {
      success: false,
      error: "Team lead must belong to the same department as the team",
    };
  }
}
  if (!name || name.length < 2) return { success: false, error: "Team name must be at least 2 characters" };

  const team = await prisma.team.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!team) return { success: false, error: "Team not found" };

  const duplicate = await prisma.team.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId, NOT: { id } },
  });
  if (duplicate) return { success: false, error: "Team with this name already exists" };

  await prisma.$transaction(async (tx) => {
    await tx.team.update({
      where: { id },
      data:  {
        name,
        description,
        leadId:       leadId       ?? null,
        departmentId: departmentId ?? null, // ✅ ADD
      },
    });

    await tx.user.updateMany({
      where: { teamId: id, organizationId: user.organizationId },
      data:  { teamId: null },
    });
    if (finalMemberIds.length > 0) {
  await tx.user.updateMany({
    where: {
      id: { in: finalMemberIds },
      organizationId: user.organizationId,
    },
    data: {
      teamId: id,
    },
  });
}
  });

  revalidatePath("/teams");
  revalidatePath(`/teams/${id}`);
  revalidatePath("/employees");
  return { success: true, message: "Team updated" };
}

// ── DELETE ────────────────────────────────────────────────────
export async function deleteTeam(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const team = await prisma.team.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!team) return { success: false, error: "Team not found" };

  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: { teamId: id },
      data:  { teamId: null },
    });
    await tx.team.delete({ where: { id } });
  });

  revalidatePath("/teams");
  revalidatePath("/employees");
  return { success: true, message: "Team deleted" };
}
