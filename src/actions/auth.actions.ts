"use server";

import bcrypt             from "bcryptjs";
import { z }              from "zod";
import { prisma }         from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { redirect }       from "next/navigation";
import { addDays }        from "date-fns";

export type ActionResult =
  | { success: true;  error?: never; message?: string }
  | { success: false; error: string };

const SignUpSchema = z.object({
  name:     z.string().min(2,  "Name must be at least 2 characters"),
  email:    z.string().email("Invalid email"),
  password: z.string().min(8,  "Password must be at least 8 characters"),
  orgName:  z.string().min(2,  "Organization name required"),
  orgSlug:  z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug: only lowercase letters, numbers, hyphens"),
  industry: z.string().optional(),
  size:     z.coerce.number().optional(),
  website:  z.string().url().optional().or(z.literal("")),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function signUpOrgAdmin(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = SignUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { name, email, password, orgName, orgSlug, industry, size, website } = parsed.data;

  const existing  = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "Email already registered" };

  const slugTaken = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (slugTaken) return { success: false, error: "Organization slug already taken" };

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: orgName, slug: orgSlug,
        industry: industry || null, size: size || null, website: website || null,
        subscriptions: { create: { plan: "FREE", active: true } },
      },
    });
    const user = await tx.user.create({
      data: { name, email, password: hashedPassword, role: "ORG_ADMIN", organizationId: org.id },
    });
    await tx.userPreference.create({ data: { userId: user.id, theme: "SYSTEM" } });
    await tx.activityLog.create({
      data: { action: "created", entityType: "Organization", entityId: org.id, userId: user.id, organizationId: org.id },
    });
    return user;
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Invalid email or password" };

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) return { success: false, error: "Invalid email or password" };


  if (!user.isActive) return { success: false, error: "Account deactivated. Contact your admin." };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { success: false, error: "Invalid email or password" };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/sign-in");
}

export async function inviteUser(data: {
  email: string; role: "MANAGER" | "HR" | "EMPLOYEE";
  organizationId: string; invitedById: string;
}): Promise<ActionResult & { token?: string }> {
  const existing = await prisma.user.findFirst({
    where: { email: data.email, organizationId: data.organizationId },
  });
  if (existing) return { success: false, error: "User already exists in this organization" };

  await prisma.invite.updateMany({
    where: { email: data.email, organizationId: data.organizationId, status: "PENDING" },
    data:  { status: "CANCELLED" },
  });

  const invite = await prisma.invite.create({
    data: {
      email: data.email, role: data.role,
      organizationId: data.organizationId, invitedById: data.invitedById,
      expiresAt: addDays(new Date(), 7),
    },
  });

  return { success: true, token: invite.token };
}

export async function acceptInvite(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const token    = formData.get("token")    as string;
  const name     = formData.get("name")     as string;
  const password = formData.get("password") as string;

  if (!token || !name || !password) return { success: false, error: "All fields are required" };
  if (name.trim().length < 2)       return { success: false, error: "Name must be at least 2 characters" };
  if (password.length < 8)          return { success: false, error: "Password must be at least 8 characters" };

  const invite = await prisma.invite.findUnique({ where: { token } });

  if (!invite)                       return { success: false, error: "Invalid invite link" };
  if (invite.status !== "PENDING")   return { success: false, error: "Invite already used or cancelled" };
  if (invite.expiresAt < new Date()) return { success: false, error: "Invite link expired. Ask admin to resend." };


  const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existingUser) {
    await prisma.invite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
    await createSession(existingUser.id);
    redirect("/dashboard");
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name:           name.trim(),
        email:          invite.email,
        password:       hashed,
        role:           invite.role,
        isEmailVerified: true,   // updated here
        organizationId: invite.organizationId,
        isActive:       true,
       
      },
    });
    await tx.userPreference.create({ data: { userId: user.id, theme: "SYSTEM" } });
    await tx.invite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
    await tx.activityLog.create({
      data: { action: "joined via invite", entityType: "User", entityId: user.id, userId: user.id, organizationId: invite.organizationId },
    });
    return user;
  });

  // ✅ Auto login — no email verification needed for invite flow
  await createSession(user.id);
  redirect("/dashboard");
}
