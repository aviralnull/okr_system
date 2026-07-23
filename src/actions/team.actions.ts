'use server'
import {prisma} from  "@/lib/prisma"
import { getCurrentUser , requireRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {z} from "zod"

export type ActionResult = |{success :true ;message?:string ; id?:string}|{success:false ; error:string}
export  async  function getTeams(organizationId :string) {
    return prisma.team.findMany({
        where : {organizationId} ,
        orderBy : {name: "asc"} ,
        select : {id:true , name:true ,description:true , leadId :true , createdAt: true , _count: {select : {users: true , objectives:true}} ,
        users : {
            take:5  ,
            select:{id:true ,name:true ,avatar:true , role:true} ,
        },
    } ,
    }) ;

}

export type TeamListItem = Awaited<ReturnType<typeof getTeams>>[number] ;


export async function getTeamById(id:string ,organizationId:string) {
    return prisma.team.findFirst({
        where: {id ,organizationId} ,
        include :{
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
export async  function getTeamFormData(organizationId:string){
    const [leads , allEmployees] = await Promise.all([
        prisma.user.findMany({
            where: {organizationId , isActive:true ,role : {in:["MANAGER" , "HR" ,"ORG_ADMIN"]}} ,
            select : {id:true ,name:true ,role:true ,avatar:true} ,
            orderBy : {name: "asc"} ,

        }) ,
        prisma.user.findMany({
            where : {organizationId, isActive:true , role: {not : "SUPER_ADMIN"}} ,
            select : {
                id:true ,   name :true ,   email:true ,role:true ,avatar:true   ,designation:true , team: {select:{id : true ,name:true}} ,
                
            } ,
            orderBy: {name: "asc"} ,
        }) ,
    ]) ;
    return {leads ,allEmployees} ;
}
export type TeamFormData = Awaited<ReturnType<typeof getTeamFormData>> ;


// ── CREATE ────────────────────────────────────────────────────
export async function createTeam(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "MANAGER");

  const name        = (formData.get("name") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() || null;
  const leadId      = (formData.get("leadId") as string) || null;
  const memberIds   = JSON.parse((formData.get("memberIds") as string) || "[]") as string[];

  if (!name || name.length < 2) return { success: false, error: "Team name must be at least 2 characters" };

  const existing = await prisma.team.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, organizationId: user.organizationId },
  });
  if (existing) return { success: false, error: "Team with this name already exists" };

  const team = await prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name,
        description,
        leadId:         leadId ?? null,
        organizationId: user.organizationId,
      },
    });

    // Assign members
    if (memberIds.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: memberIds }, organizationId: user.organizationId },
        data:  { teamId: team.id },
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

  const name        = (formData.get("name") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() || null;
  const leadId      = (formData.get("leadId") as string) || null;
  const memberIds   = JSON.parse((formData.get("memberIds") as string) || "[]") as string[];

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
      data:  { name, description, leadId: leadId ?? null },
    });

    // Remove all current members, reassign selected
    await tx.user.updateMany({
      where: { teamId: id, organizationId: user.organizationId },
      data:  { teamId: null },
    });
    if (memberIds.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: memberIds }, organizationId: user.organizationId },
        data:  { teamId: id },
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
