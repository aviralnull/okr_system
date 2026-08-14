// import { Resend } from "resend";
// import { renderToStaticMarkup } from "react-dom/server";
// import { InviteEmail } from "../../emails/invitation-email";
// import * as React from "react"
// const resend = new  Resend(process.env.RESEND_API_KEY)
// export  async function sendInviteEmail({
//     to , invitetoken ,orgName ,inviterName ,role}: {to:string ; invitetoken:string ; orgName:string ;inviterName:string ; role:string}) {
//         const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${invitetoken}` ;
//         const html = renderToStaticMarkup(
//             React.createElement(InviteEmail ,{inviteLink , orgName , inviterName , role ,email:to ,expiresIn: "7 days"})
//         )
//         const {error} = await resend.emails.send({
//             from : "OKR Desk <onboarding@resend.dev>",
//             to : [to] ,
//             subject : `You're  invited to  join ${orgName} on OKR Desk` ,
//             html,

//         }) ;

//         if(error) {
//             console.error("Email send error: ", error  ) ;
//             throw new Error("Failed to  send invite email") 
//         }
//     }



// import { Resend } from "resend";
// import { render } from "@react-email/render";
// import { InviteEmail } from "../../emails/invitation-email";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function sendInviteEmail({
//   to,
//   invitetoken,
//   orgName,
//   inviterName,
//   role,
// }: {
//   to: string;
//   invitetoken: string;
//   orgName: string;
//   inviterName: string;
//   role: string;
// }) {
//   const inviteLink =
//     `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitetoken}`;

//   const html = await render(
//     <InviteEmail
//       inviteLink={inviteLink}
//       orgName={orgName}
//       inviterName={inviterName}
//       role={role}
//       email={to}
//       expiresIn="7 days"
//     />
//   );

//   const { error } = await resend.emails.send({
//     from: "noreply@yourcompany.com",
//     to: [to],
//     subject: `You're invited to join ${orgName} on OKR Desk`,
//     html,
//   });

//   if (error) {
//     console.error(error);
//     throw new Error("Failed to send invite");
//   }
// }





// import { render } from "@react-email/render";
// import { transporter } from "./mail";
// import { InviteEmail } from "../../emails/invitation-email";

// export async function sendInviteEmail({
//   to,
//   invitetoken,
//   orgName,
//   inviterName,
//   role,
// }: {
//   to: string;
//   invitetoken: string;
//   orgName: string;
//   inviterName: string;
//   role: string;
// }) {
//   const inviteLink =
//     `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitetoken}`;

//   const html = await render(
//     <InviteEmail
//       inviteLink={inviteLink}
//       orgName={orgName}
//       inviterName={inviterName}
//       role={role}
//       email={to}
//       expiresIn="7 days"
//     />
//   );

//   await transporter.sendMail({
//     from: `"OKR Desk" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: `You're invited to join ${orgName} on OKR Desk`,
//     html,
//   });

//   console.log("Invite email sent to:", to);
// }



import { render } from "@react-email/render";
import { transporter } from "./mail";
import { InviteEmail } from "../../emails/invitation-email";
import { prisma } from "@/lib/prisma";

export async function sendInviteEmail({
  to,
  invitetoken,
  organizationId,
  orgName,
  inviterName,
  role,
}: {
  to: string;
  invitetoken: string;
  organizationId: string;
  orgName: string;
  inviterName: string;
  role: string;
}) {
  const inviteLink =
    `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitetoken}`;

  // Get organization's saved branding
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      logo: true,
    },
  });

  // Get latest primary color from branding activity log
  const brandingLog = await prisma.activityLog.findFirst({
    where: {
      organizationId,
      entityType: "Branding",
      action: "updated",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      metadata: true,
    },
  });

  const metadata = (brandingLog?.metadata ?? {}) as {
    primaryColor?: string;
  };

  const orgLogo = organization?.logo ?? null;

  const primaryColor =
    metadata.primaryColor ?? "#6366f1";

  const html = await render(
    <InviteEmail
      inviteLink={inviteLink}
      orgName={orgName}
      orgLogo={orgLogo}
      primaryColor={primaryColor}
      inviterName={inviterName}
      role={role}
      email={to}
      expiresIn="7 days"
    />
  );

  await transporter.sendMail({
    from: `"OKR Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `You're invited to join ${orgName} on OKR Desk`,
    html,
  });

  console.log("Invite email sent to:", to);
}