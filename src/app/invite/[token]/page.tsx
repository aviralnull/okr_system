import {prisma} from "@/lib/prisma"
import { notFound } from "next/navigation"
import { AcceptInviteFrom } from "@/components/auth/accept-invite-form" 
interface Props {
    params : Promise<{token:string}> ;
}
export default async function InviteAcceptPage({params}:Props){
    const {token} = await params ;
    const invite = await prisma.invite.findUnique({
        where : {token} ,
        include : {organization : {select: {name:true ,logo:true}}} ,

    }) ;
    if(!invite) return notFound() ;
    if(invite.status !=="PENDING") return <InviteUsed status={invite.status}/>
    if(invite.expiresAt <new Date())return  <InviteExpired orgName={invite.organization.name} />
     return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
 
        {/* Org header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-4">
            {invite.organization.name.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join {invite.organization.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            You've been invited as a <span className="font-medium text-primary">{invite.role.replace("_", " ")}</span>
          </p>
        </div>
 
        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="mb-5 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Joining as</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{invite.email}</p>
          </div>
 
          <AcceptInviteFrom token={token} />
        </div>
 
        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{" "}
          <a href="/sign-in" className="text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

function InviteUsed({status}: {status:string}){
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
                <div  className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                   <span className="text-2xl">⚠️</span>

                </div>
                 <h1 className="text-xl font-bold text-foreground mb-2">Invite Already Used</h1>
        <p className="text-sm text-muted-foreground mb-6">Thisinvite link has already been {status.toLowerCase()}</p>
          <a href="/sign-in" className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          Sign In
        </a>
            </div>
        </div>
    ) ;
}


 
function InviteExpired({ orgName }: { orgName: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⏰</span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Invite Expired</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This invite to <strong>{orgName}</strong> has expired.
          Please ask your admin to send a new invite.
        </p>
      </div>
    </div>
  );
}