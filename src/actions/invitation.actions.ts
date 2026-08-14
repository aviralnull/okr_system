// src/actions/invitation.actions.ts
"use server";

import { prisma }         from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Resend }         from "resend";
import { addDays }        from "date-fns";
import { sendInviteEmail } from "@/lib/send-invite";
const resend = new Resend(process.env.RESEND_API_KEY!);

export type ActionResult =
  | { success: true;  message?: string }
  | { success: false; error: string };

// ── Get all invites ───────────────────────────────────────────
export async function getInvitations(organizationId: string) {
  return prisma.invite.findMany({
    where:   { organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, role: true, status: true,
      expiresAt: true, createdAt: true, token: true,
      invitedById: true,
    },
  });
}

export type InvitationItem = Awaited<ReturnType<typeof getInvitations>>[number];

// ── Send invite ───────────────────────────────────────────────
export async function sendInvitation(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const role  = formData.get("role") as string;

  if (!email) return { success: false, error: "Email is required" };
  if (!["MANAGER", "HR", "EMPLOYEE"].includes(role)) {
    return { success: false, error: "Invalid role" };
  }

  // Check already a user
  const existing = await prisma.user.findFirst({
    where: { email, organizationId: user.organizationId },
  });
  if (existing) return { success: false, error: "This email is already a member" };

  // Cancel old pending invites for this email + org
  await prisma.invite.updateMany({
    where: { email, organizationId: user.organizationId, status: "PENDING" },
    data:  { status: "CANCELLED" },
  });

  const invite = await prisma.invite.create({
    data: {
      email,
      role:           role as any,
      organizationId: user.organizationId,
      invitedById:    user.id,
      expiresAt:      addDays(new Date(), 7),
    },
  });

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;

  try {
    // await resend.emails.send({
    //   from:    process.env.RESEND_FROM_EMAIL ?? "OKR Desk <noreply@okrdesk.com>",
    //   to:      email,
    //   subject: `You're invited to join ${user.organization?.name ?? "OKR Desk"}`,
    //   html: `
    //     <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
    //       <h2 style="color:#6366f1;margin-bottom:8px">You're invited! 🎉</h2>
    //       <p style="color:#64748b;margin-bottom:8px">
    //         <strong>${user.name}</strong> has invited you to join
    //         <strong>${user.organization?.name ?? "OKR Desk"}</strong> as a <strong>${role}</strong>.
    //       </p>
    //       <p style="color:#64748b;margin-bottom:24px">Click below to accept and set your password. This link expires in 7 days.</p>
    //       <a href="${inviteLink}"
    //         style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
    //         Accept invitation
    //       </a>
    //       <p style="color:#94a3b8;font-size:12px;margin-top:24px">
    //         Or paste: ${inviteLink}
    //       </p>
    //     </div>
    //   `,
    // });
  



  await sendInviteEmail({
  to: invite.email,
  invitetoken: invite.token,
  organizationId: user.organizationId,
  orgName: user.organization?.name ?? "OKR Desk",
  inviterName: user.name,
  role: invite.role.toString(),
});
  } catch (err) {
    console.error("Email send error:", err);
    // Invite created — just email failed
  }

  revalidatePath("/invitations");
  return { success: true, message: `Invitation sent to ${email}` };
}

// ── Resend invite ─────────────────────────────────────────────
export async function resendInvitation(inviteId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const invite = await prisma.invite.findFirst({
    where: { id: inviteId, organizationId: user.organizationId },
  });
  if (!invite) return { success: false, error: "Invite not found" };

  // Extend expiry + reset to PENDING
  const updated = await prisma.invite.update({
    where: { id: inviteId },
    data:  { status: "PENDING", expiresAt: addDays(new Date(), 7) },
  });

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${updated.token}`;

  try {
  await sendInviteEmail({
  to: updated.email,
  invitetoken: updated.token,
  organizationId: user.organizationId,
  orgName: user.organization?.name ?? "OKR Desk",
  inviterName: user.name,
  role: updated.role.toString(),
});

  } catch { /* silent */ }

  revalidatePath("/invitations");
  return { success: true, message: "Invitation resent" };
}

// ── Cancel invite ─────────────────────────────────────────────
export async function cancelInvitation(inviteId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  const invite = await prisma.invite.findFirst({
    where: { id: inviteId, organizationId: user.organizationId },
  });
  if (!invite) return { success: false, error: "Invite not found" };

  await prisma.invite.update({
    where: { id: inviteId },
    data:  { status: "CANCELLED" },
  });

  revalidatePath("/invitations");
  return { success: true, message: "Invitation cancelled" };
}

// ── Delete invite ─────────────────────────────────────────────
export async function deleteInvitation(inviteId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  requireRole(user.role, "ORG_ADMIN");

  await prisma.invite.deleteMany({
    where: { id: inviteId, organizationId: user.organizationId },
  });

  revalidatePath("/invitations");
  return { success: true };
}