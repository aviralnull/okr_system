"use server";

import bcrypt             from "bcryptjs";
import { z }              from "zod";
import { prisma }         from "@/lib/prisma";
// Dynamic require for session utilities. If the aliased module cannot be
// resolved at build time, fall back to stub implementations to avoid
// "Cannot find module '@/lib/session'" errors while preserving runtime
// behavior when the module is available.
let createSession: any;
let deleteSession: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const _s = require("@/lib/session");
  createSession = _s.createSession;
  deleteSession = _s.deleteSession;
} catch (err) {
  // Provide minimal stubs that throw descriptive errors if used.
  createSession = async () => {
    throw new Error("createSession is not available: '@/lib/session' could not be resolved");
  };
  deleteSession = async () => {
    throw new Error("deleteSession is not available: '@/lib/session' could not be resolved");
  };
}
import { redirect }       from "next/navigation";
import { addDays }        from "date-fns";


// ─────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────

const SignUpSchema = z.object({
  name:     z.string().min(2,  "Name must be at least 2 characters"),
  email:    z.string().email("Invalid email"),
  password: z.string().min(8,  "Password must be at least 8 characters"),
  orgName:  z.string().min(2,  "Organization name required"),
  orgSlug:  z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug: only lowercase letters, numbers, hyphens"),
  industry: z.string().optional(),
  size:     z.coerce.number().optional(),
  website:  z.string().url().optional().or(z.literal("")),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const SetPasswordSchema = z.object({
  token:    z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type ActionResult =
  | { success: true;  error?: never }
  | { success: false; error: string };

// ─────────────────────────────────────────────────────────────
// 1. ORG ADMIN SIGN UP
// ─────────────────────────────────────────────────────────────

export async function signUpOrgAdmin(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw    = Object.fromEntries(formData);
  const parsed = SignUpSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password, orgName, orgSlug, industry, size, website } =
    parsed.data;

  // Email already registered?
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "Email already registered" };

  // Slug taken?
  const slugTaken = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (slugTaken) return { success: false, error: "Organization slug already taken" };

  const hashedPassword = await bcrypt.hash(password, 12);

  // Create org + admin user in one transaction
  const user = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name:     orgName,
        slug:     orgSlug,
        industry: industry || null,
        size:     size     || null,
        website:  website  || null,
        subscriptions: {
          create: { plan: "FREE", active: true },
        },
      },
    });

    const user = await tx.user.create({
      data: {
        name,
        email,
        password:       hashedPassword,
        role:           "ORG_ADMIN",
        organizationId: org.id,
      },
    });

    // Default preferences (theme = SYSTEM)
    await tx.userPreference.create({
      data: { userId: user.id, theme: "SYSTEM" },
    });

    // Seed first activity log
    await tx.activityLog.create({
      data: {
        action:         "created",
        entityType:     "Organization",
        entityId:       org.id,
        userId:         user.id,
        organizationId: org.id,
      },
    });

    return user;
  });

  await createSession(user.id);
  redirect("/dashboard");
}

// ─────────────────────────────────────────────────────────────
// 2. LOGIN — all roles
// ─────────────────────────────────────────────────────────────

export async function login(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw    = Object.fromEntries(formData);
  const parsed = LoginSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Invalid email or password" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    return { success: false, error: "Invalid email or password" };
  }

  if (!user.isActive) {
    return {
      success: false,
      error:   "Your account has been deactivated. Contact your admin.",
    };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { success: false, error: "Invalid email or password" };

  await createSession(user.id);
  redirect("/dashboard");
}

// ─────────────────────────────────────────────────────────────
// 3. LOGOUT
// ─────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/sign-in");
}

// ─────────────────────────────────────────────────────────────
// 4. INVITE USER (called by ORG_ADMIN from dashboard)
// ─────────────────────────────────────────────────────────────

export async function inviteUser(data: {
  email:          string;
  role:           "MANAGER" | "HR" | "EMPLOYEE";
  organizationId: string;
  invitedById:    string;
}): Promise<ActionResult & { token?: string }> {
  // Already a user in this org?
  const existing = await prisma.user.findFirst({
    where: { email: data.email, organizationId: data.organizationId },
  });
  if (existing) return { success: false, error: "User already exists in this organization" };

  // Cancel old pending invites for same email + org
  await prisma.invite.updateMany({
    where: {
      email:          data.email,
      organizationId: data.organizationId,
      status:         "PENDING",
    },
    data: { status: "CANCELLED" },
  });

  const invite = await prisma.invite.create({
    data: {
      email:          data.email,
      role:           data.role,
      organizationId: data.organizationId,
      invitedById:    data.invitedById,
      expiresAt:      addDays(new Date(), 7),
    },
    include: { organization: true },
  });

  // TODO: Send invite email via Resend
  // const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;
  // await sendInviteEmail({ to: data.email, link: inviteLink, orgName: invite.organization.name });

  return { success: true, token: invite.token };
}

// ─────────────────────────────────────────────────────────────
// 5. ACCEPT INVITE + SET PASSWORD
// ─────────────────────────────────────────────────────────────


export async function acceptInvite(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const token    = formData.get("token")    as string;
  const name     = formData.get("name")     as string;
  const password = formData.get("password") as string;

  if (!token || !name || !password) {
    return { success: false, error: "All fields are required" };
  }
  if (name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters" };
  }
  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const invite = await prisma.invite.findUnique({ where: { token } });

  if (!invite)                       return { success: false, error: "Invalid invite link" };
  if (invite.status !== "PENDING")   return { success: false, error: "Invite already used or cancelled" };
  if (invite.expiresAt < new Date()) return { success: false, error: "Invite link has expired. Ask your admin to resend." };

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    // Create user with name from form
    const user = await tx.user.create({
      data: {
        name:           name.trim(),
        email:          invite.email,
        password:       hashedPassword,
        role:           invite.role,
        organizationId: invite.organizationId,
      },
    });

    await tx.userPreference.create({
      data: { userId: user.id, theme: "SYSTEM" },
    });

    await tx.invite.update({
      where: { id: invite.id },
      data:  { status: "ACCEPTED" },
    });

    await tx.activityLog.create({
      data: {
        action:         "joined",
        entityType:     "User",
        entityId:       user.id,
        userId:         user.id,
        organizationId: invite.organizationId,
      },
    });

    return user;
  });

  await createSession(user.id);
  redirect("/dashboard");
}