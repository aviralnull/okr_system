

import { render }   from "@react-email/render";
import { transporter } from "./mail";

import { ForgotPasswordEmail }    from "../../emails/forgot-password-email";
import { VerificationEmail }      from "../../emails/verification-email";
import { ReviewNotificationEmail } from "../../emails/review-notification-email";
import { OkrAssignedEmail }       from "../../emails/okr-assigned-email";
import { prisma } from "./prisma";

// ── 1. FORGOT PASSWORD ────────────────────────────────────────
// export async function sendForgotPasswordEmail({
//   to, userName, resetToken,
// }: {
//   to: string; userName: string; resetToken: string;
// }) {
//   const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;

//   const html = await render(
//     <ForgotPasswordEmail
//       resetLink={resetLink}
//       userName={userName}
//       orgName={orgName}
//   orgLogo={orgLogo}
//       expiresIn="1 hour"
//     />
//   );

//   await transporter.sendMail({
//     from:    `"OKR Desk" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "Reset your OKR Desk password",
//     html,
//   });

//   console.log("Forgot password email sent to:", to);
// }



export async function sendForgotPasswordEmail({
  to,
  userName,
  resetToken,
}: {
  to: string;
  userName: string;
  resetToken: string;
}) {
  // Get user + organization
  const user = await prisma.user.findUnique({
    where: {
      email: to,
    },
    select: {
      organizationId: true,
      organization: {
        select: {
          name: true,
          logo: true,
        },
      },
    },
  });

  const orgName =
    user?.organization?.name ?? "OKR Desk";

  const orgLogo =
    user?.organization?.logo ?? null;

  // Get latest branding color
  let primaryColor = "#6366f1";

  if (user?.organizationId) {
    const brandingLog =
      await prisma.activityLog.findFirst({
        where: {
          organizationId: user.organizationId,
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

    const metadata =
      (brandingLog?.metadata ?? {}) as {
        primaryColor?: string;
      };

    primaryColor =
      metadata.primaryColor ?? "#6366f1";
  }

  const resetLink =
    `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;

  const html = await render(
    <ForgotPasswordEmail
      resetLink={resetLink}
      userName={userName}
      orgName={orgName}
      orgLogo={orgLogo}
      primaryColor={primaryColor}
      expiresIn="1 hour"
    />
  );

  await transporter.sendMail({
    from: `"OKR Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Reset your ${orgName} password`,
    html,
  });

  console.log(
    `Forgot password email sent to ${to} for ${orgName}`
  );
}

// ── 2. VERIFICATION CODE (OTP) ────────────────────────────────
export async function sendVerificationEmail({
  to, userName, otp,
}: {
  to: string; userName: string; otp: string;
}) {
  const html = await render(
    <VerificationEmail
      otp={otp}
      userName={userName}
      expiresIn="15 minutes"
    />
  );

  await transporter.sendMail({
    from:    `"OKR Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OKR Desk verification code",
    html,
  });

  console.log("Verification email sent to:", to);
}

// ── 3. REVIEW SUBMITTED notification ─────────────────────────
// export async function sendReviewNotificationEmail({
//   to, employeeName, reviewerName, orgName, reviewPeriod, rating,
// }: {
//   to: string; employeeName: string; reviewerName: string;
//   orgName: string; reviewPeriod: string; rating: number;
// }) {
//   const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/reviews`;

//   const html = await render(
//     <ReviewNotificationEmail
//       employeeName={employeeName}
//       reviewerName={reviewerName}
//       orgName={orgName}
//       reviewPeriod={reviewPeriod}
//       rating={rating}
//       dashboardLink={dashboardLink}
//     />
//   );

//   await transporter.sendMail({
//     from:    `"OKR Desk" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: `Your ${reviewPeriod} performance review is ready`,
//     html,
//   });

//   console.log("Review notification sent to:", to);
// }




export async function sendReviewNotificationEmail({
  to,
  employeeName,
  reviewerName,
  orgName,
  reviewPeriod,
  rating,
  organizationId,
}: {
  to: string;
  employeeName: string;
  reviewerName: string;
  orgName: string;
  reviewPeriod: string;
  rating: number;
  organizationId: string;
}) {
  const dashboardLink =
    `${process.env.NEXT_PUBLIC_APP_URL}/reviews`;

  // Get organization logo
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      logo: true,
      name: true,
    },
  });

  // Get latest branding configuration
  const brandingLog =
    await prisma.activityLog.findFirst({
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

  const metadata =
    (brandingLog?.metadata ?? {}) as {
      primaryColor?: string;
    };

  const finalOrgName =
    organization?.name ?? orgName ?? "OKR Desk";

  const orgLogo =
    organization?.logo ?? null;

  const primaryColor =
    metadata.primaryColor ?? "#6366f1";

  const html = await render(
    <ReviewNotificationEmail
      employeeName={employeeName}
      reviewerName={reviewerName}
      orgName={finalOrgName}
      reviewPeriod={reviewPeriod}
      rating={rating}
      dashboardLink={dashboardLink}
      orgLogo={orgLogo}
      primaryColor={primaryColor}
    />
  );

  await transporter.sendMail({
    from: `"OKR Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your ${reviewPeriod} performance review is ready`,
    html,
  });

  console.log(
    "Review notification sent to:",
    to
  );
}

// ── 4. OKR ASSIGNED notification ─────────────────────────────
// export async function sendOkrAssignedEmail({
//    to,
//   employeeName,
//   assignerName,
//   objectiveTitle,
//   objectiveId,
//   quarter,
//   dueDate,
//   priority,
//   organizationId,
// }: {
//    to: string;
//   employeeName: string;
//   assignerName: string;
//   objectiveTitle: string;
//   objectiveId: string;
//   quarter: string;
//   dueDate: string;
//   priority: string;
//   organizationId: string;
// }) {
//   const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/objectives/${objectiveId}`;

//   const html = await render(
//     <OkrAssignedEmail
//       employeeName={employeeName}
//       assignerName={assignerName}
//       objectiveTitle={objectiveTitle}
//       quarter={quarter}
//       dueDate={dueDate}
//       priority={priority}
//       dashboardLink={dashboardLink}
//     />
//   );

//   await transporter.sendMail({
//     from:    `"OKR Desk" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: `New objective assigned: ${objectiveTitle}`,
//     html,
//   });

//   console.log("OKR assigned email sent to:", to);
// }



export async function sendOkrAssignedEmail({
  to,
  employeeName,
  assignerName,
  objectiveTitle,
  objectiveId,
  quarter,
  dueDate,
  priority,
  organizationId,
}: {
  to: string;
  employeeName: string;
  assignerName: string;
  objectiveTitle: string;
  objectiveId: string;
  quarter: string;
  dueDate: string;
  priority: string;
  organizationId: string;
}) {
  const dashboardLink =
    `${process.env.NEXT_PUBLIC_APP_URL}/objectives/${objectiveId}`;

  // Get organization branding
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      name: true,
      logo: true,
    },
  });

  const brandingLog =
    await prisma.activityLog.findFirst({
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

  const metadata =
    (brandingLog?.metadata ?? {}) as {
      primaryColor?: string;
    };

  const orgName =
    organization?.name ?? "OKR Desk";

  const orgLogo =
    organization?.logo ?? null;

  const primaryColor =
    metadata.primaryColor ?? "#6366f1";

  const html = await render(
    <OkrAssignedEmail
      employeeName={employeeName}
      assignerName={assignerName}
      objectiveTitle={objectiveTitle}
      quarter={quarter}
      dueDate={dueDate}
      priority={priority}
      dashboardLink={dashboardLink}
      orgName={orgName}
      orgLogo={orgLogo}
      primaryColor={primaryColor}
    />
  );

  await transporter.sendMail({
    from: `"OKR Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `New objective assigned: ${objectiveTitle}`,
    html,
  });

  console.log(
    "OKR assigned email sent to:",
    to
  );
}

