"use server"
import {prisma} from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {z} from "zod"
import bcrypt from "bcryptjs"
import { addDays } from "date-fns"
import { sendInviteEmail } from "@/lib/send-invite"


const InviteSchema = z.object({
    email: z.string().email("Invalid email")  ,
    role : z.enum(["MANAGER" ,"HR" ,"EMPLOYEE"]),
    departmentId :z.string().optional(),
    teamId : z.string().optional()
}) ;
const EditSchema = z.object({
    userId : z.string() ,
    name : z.string().min(2) ,
    role : z.enum(["MANAGER" , "HR" , "EMPLOYEE"]),
    departmentId: z.string().nullable(),
    teamId:       z.string().nullable(),
    managerId:    z.string().nullable(),
    designation:  z.string().nullable(),

}) ;

export type ActionResult = | {success: true, message?: string} |{success: false , error: string} ;

export async function getEmployees(organizationId:string){
    const employees = await prisma.user.findMany({
        where : {organizationId , role : {not: "SUPER_ADMIN"}} ,
        orderBy : {joinedAt: "desc"} ,
        select: {
            id : true ,
            name: true ,
            email: true ,
            role : true,
            designation : true ,
            isActive: true ,
            avatar: true,
            joinedAt : true ,
            employeeId : true ,
            department :  {select : {id:true ,name: true}} ,
            team :  {select : {id:true , name: true}} ,
            manager :{select: {id: true ,name:true}} ,
            _count : {select: {objectives: true}}
        } ,
    }) ;
    return employees ;
}

export type Employee = Awaited<ReturnType<typeof getEmployees>>[number] ;

export async function getEmployeeFormData(organizationId: string) {
    const [ departments ,teams , managers] = await Promise.all([
        prisma.department.findMany({
            where: {organizationId} ,
            select : {id: true ,name:true},
            orderBy : {name: "asc"} ,
        }) ,
        prisma.team.findMany({
            where:{organizationId} ,
            select: {id:true ,name:true},
            orderBy: {name:"asc"},
        }) ,
        prisma.user.findMany({
            where: {organizationId, role : {in :["MANAGER", "HR" , "ORG_ADMIN"]}} ,
            select : {id:true ,name:true ,role:true} ,
            orderBy: {name: "asc"}
        })
    ]) ;
    return {departments , teams ,managers}
}


export async  function inviteEmployee(
    formData : FormData
) :Promise<ActionResult>{
    const user = await getCurrentUser() ;
    const raw = Object.fromEntries(formData) ;
    const parsed = InviteSchema.safeParse(raw) ;
    if(!parsed.success){
        return { success: false, error: parsed.error.issues[0].message };
    }
    const {email ,role ,departmentId ,teamId} = parsed.data ;
  let  invitetoken: string ;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({
        where:  { email, organizationId: user.organizationId },
        select: { id: true },
      });
      if (existing) throw new Error("User with this email already exists");
 
      await tx.invite.updateMany({
        where: { email, organizationId: user.organizationId, status: "PENDING" },
        data:  { status: "CANCELLED" },
      });
 
      const invite = await tx.invite.create({
        data: {
          email,
          role,
          organizationId: user.organizationId,
          invitedById:    user.id,
          expiresAt:      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
 
      await tx.activityLog.create({
        data: {
          action:         "invited",
          entityType:     "User",
          entityId:       email,
          userId:         user.id,
          organizationId: user.organizationId,
          metadata:       { email, role },
        },
      });
 
      return invite;
    });
 
    invitetoken = result.token;
  } catch (err: any) {
    return { success: false, error: err.message ?? "Something went wrong" };
  }
    //   try {
    //     await sendInviteEmail({
    //         to :email ,
    //         invitetoken ,
    //         orgName:     user.organization?.name ?? "Your Organization",
    //         inviterName: user.name,
    //         role ,
    //     })
    //   } catch(error){

    //     console.error("Email failed  but invite was created" , error) 
    //   }[]
   
  

    await prisma.activityLog.create({
        data :{
            action : "invited" ,
            entityType : "User",
            entityId : email ,
            userId : user.id,
            organizationId: user.organizationId,
            metadata : {email, role} ,

        } ,

    })
    try {
        await sendInviteEmail({
            to :email ,
            invitetoken ,
            orgName:     user.organization?.name ?? "Your Organization",
            inviterName: user.name,
            role ,
        })
      } catch(error){

        console.error("Email failed  but invite was created" , error) 
      }[]
   
    revalidatePath("/employees") ;
    return {success: true ,message : `Invite sent to ${email}` } ;

}


export async function editEmployee(
    formData : FormData
) : Promise<ActionResult>{
    const user  = await getCurrentUser() ;
    const raw = Object.fromEntries(formData) ;
    const parsed = EditSchema.safeParse({
        ...raw  ,
        departmentId : raw.departmentId || null ,
        teamId :  raw.teamId || null ,
        managerId : raw.managerId ||null,
        designation : raw.designation ||null 
    }) ;
    if(!parsed.success){
        return {success: false , error: parsed.error.issues[0].message} ;

    }
    const {userId , name ,role , departmentId ,teamId , managerId , designation} = parsed.data ;
    const  employee = await  prisma.user.findFirst({
        where: {id :userId  , organizationId:user.organizationId} ,

    }) ;
    if(!employee){
        return {success : false ,  error : "Employee not found"} ;

    }
    if(userId ===user.id){
        return  {success:false ,error : "You cannot  edit your own  role"} ;

    }
    await prisma.user.update({
        where: {id:userId} ,
        data: {
            name, role , designation , departmentId: departmentId??null ,
            teamId : teamId ?? null ,
            managerId : managerId??null ,
        }
    }) ;
    await prisma.activityLog.create({
        data:{
            action : "updated" ,
            entityType : "User",
            entityId: userId ,
            userId: user.id ,
            organizationId : user.organizationId ,
        } ,

    }) ;
    revalidatePath("/employees") ;
    return {success :true , message:"Employee upedated successfully"} ;

}


export async function toggleEmployeeStatus(
    employeeId: string 
) :  Promise<ActionResult>{
    const user = await  getCurrentUser() ;
    if(employeeId === user.id) {
        return {success: false ,error : "You cannot  deactivate yourself"} ;

    }
    const  employee = await prisma.user.findFirst({
        where: {id:employeeId , organizationId: user.organizationId} ,
        select: {isActive: true ,name:true} ,

    }) ;
    if(!employee)return {success:false , error: "Employee not found" } ;

    await prisma.user.update({
        where: {id:employeeId} ,
        data: {isActive : !employee.isActive} ,
    }) ;
    await prisma.activityLog.create({
        data:{
            action: employee.isActive?"deactivated" : "activated" ,
            entityType : "User" ,
            entityId: employeeId ,
            userId: user.id ,
            organizationId: user.organizationId ,
        } ,

    })
    revalidatePath("/employees") ;
    return {
        success: true ,
        message : `${employee.name} ${employee.isActive?"deactivated" : "activated"}` ,
    } ;
}


export async function deleteEmployee(
    employeeId : string
) : Promise<ActionResult>{
    const user = await getCurrentUser()  ;
    if(employeeId=== user.id){
        return {success:false , error: "You cannot  delete yourself"} ;

    }
    const employee = await prisma.user.findFirst({
        where: {id: employeeId , organizationId: user.organizationId} ,
        select : {name:true} ,
    }) ;

    if(!employee)return {success : false , error :"Employee not found"} ;

    await prisma.user.update({
        where : {id : employeeId} ,
        data : {isActive:false , email: `deleted_${employeeId}@deleted.com`} ,

    }) ;

    await prisma.activityLog.create({
        data:  {
            action : "deleted" ,
            entityType : "USer" ,
            entityId : employeeId ,
            userId : user.id , 
            organizationId : user.organizationId ,
        } ,

    }) ;
    revalidatePath("/employees") ;
    return {success:true , message :`${employee.name} removed`} ;
}
