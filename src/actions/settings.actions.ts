// src/actions/settings.actions.ts
"use server";

import { prisma }         from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z }              from "zod";
import bcrypt             from "bcryptjs";
import cloudinary from "@/lib/cloudinary";

export type ActionResult =
  | { success: true;  message?: string }
  | { success: false; error: string };

// ── GET FULL SETTINGS DATA ────────────────────────────────────
export async function getSettingsData(userId: string, organizationId: string) {
  const [user, org, subscription] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: {
        id: true, name: true, email: true, avatar: true,
        designation: true, bio: true, role: true,
        joinedAt: true, employeeId: true,
        preferences: { select: { theme: true } },
      },
    }),
    prisma.organization.findUnique({
      where:  { id: organizationId },
      select: {
        id: true, name: true, slug: true, logo: true,
        industry: true, website: true, size: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
    }),
    prisma.subscription.findFirst({
      where:   { organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, plan: true, status: true,
        currentPeriodEnd: true, cancelAtPeriodEnd: true,
      },
    }),
  ]);

  return { user, org, subscription };
}

export type SettingsData = Awaited<ReturnType<typeof getSettingsData>>;

// ── UPDATE PROFILE ────────────────────────────────────────────
// const ProfileSchema = z.object({
//   name:        z.string().min(2, "Name must be at least 2 characters"),
//   designation: z.string().optional().nullable(),
//   bio:         z.string().max(300, "Bio max 300 characters").optional().nullable(),
// });

// export async function updateProfile(formData: FormData): Promise<ActionResult> {
//   const user = await getCurrentUser();

//   const parsed = ProfileSchema.safeParse({
//     name:        formData.get("name") ?? "",
//     designation: (formData.get("designation") as string) || null,
//     bio:         (formData.get("bio") as string) || null,
//   });
//   if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

//   await prisma.user.update({
//     where: { id: user.id },
//     data:  {
//       name:        parsed.data.name,
//       designation: parsed.data.designation,
//       bio:         parsed.data.bio,
//     },
//   });

//   revalidatePath("/settings");
//   revalidatePath("/dashboard");
//   return { success: true, message: "Profile updated successfully" };
// }



// ── UPDATE PROFILE ────────────────────────────────────────────
const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().optional().nullable(),
  bio: z
    .string()
    .max(300, "Bio max 300 characters")
    .optional()
    .nullable(),
});

export async function updateProfile(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    const parsed = ProfileSchema.safeParse({
      name: formData.get("name") ?? "",
      designation: (formData.get("designation") as string) || null,
      bio: (formData.get("bio") as string) || null,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0].message,
      };
    }

    const avatarFile = formData.get("avatar");
    const avatarUrl = (
      (formData.get("avatarUrl") as string) || ""
    ).trim();

    let finalAvatar: string | undefined;

    // =========================================================
    // 1. COMPUTER UPLOAD
    // =========================================================
    if (avatarFile instanceof File && avatarFile.size > 0) {
      // Validate file type
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
      ];

      if (!allowedTypes.includes(avatarFile.type)) {
        return {
          success: false,
          error: "Only PNG, JPG and WEBP images are allowed",
        };
      }

      // Validate size
      if (avatarFile.size > 2 * 1024 * 1024) {
        return {
          success: false,
          error: "Image must be smaller than 2MB",
        };
      }

      // Convert File → Buffer
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const uploadResult = await new Promise<{
        secure_url: string;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "okr-desk/avatars",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Cloudinary upload failed"));
              return;
            }

            resolve({
              secure_url: result.secure_url,
            });
          }
        );

        uploadStream.end(buffer);
      });

      finalAvatar = uploadResult.secure_url;
    }

    // =========================================================
    // 2. URL
    // =========================================================
    else if (avatarUrl) {
      try {
        const url = new URL(avatarUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          return {
            success: false,
            error: "Invalid image URL",
          };
        }
      } catch {
        return {
          success: false,
          error: "Invalid image URL",
        };
      }

      finalAvatar = avatarUrl;
    }

    // =========================================================
    // 3. UPDATE USER
    // =========================================================
  const updateData: {
  name: string;
  designation: string | null;
  bio: string | null;
  avatar?: string;
} = {
  name: parsed.data.name,
  designation: parsed.data.designation ?? null,
  bio: parsed.data.bio ?? null,
};

    // Only change avatar when user selected/provided one.
    if (finalAvatar !== undefined) {
      updateData.avatar = finalAvatar;
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("updateProfile error:", error);

    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}
// ── UPDATE AVATAR ─────────────────────────────────────────────
export async function updateAvatar(avatarUrl: string): Promise<ActionResult> {
  const user = await getCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data:  { avatar: avatarUrl },
  });

  revalidatePath("/settings");
  return { success: true, message: "Avatar updated" };
}

// ── CHANGE PASSWORD ───────────────────────────────────────────
const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword:     z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path:    ["confirmPassword"],
});

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();

  const parsed = PasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") ?? "",
    newPassword:     formData.get("newPassword") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const dbUser = await prisma.user.findUnique({
    where:  { id: user.id },
    select: { password: true },
  });
  if (!dbUser?.password) return { success: false, error: "No password set" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, dbUser.password);
  if (!valid) return { success: false, error: "Current password is incorrect" };

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { success: false, error: "New password must be different from current" };
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return { success: true, message: "Password changed successfully" };
}

// ── UPDATE THEME PREFERENCE ───────────────────────────────────
export async function updateThemePreference(theme: "LIGHT" | "DARK" | "SYSTEM"): Promise<ActionResult> {
  const user = await getCurrentUser();

  await prisma.userPreference.upsert({
    where:  { userId: user.id },
    create: { userId: user.id, theme },
    update: { theme },
  });

  revalidatePath("/settings");
  return { success: true };
}

// ── UPDATE ORG SETTINGS ───────────────────────────────────────
const OrgSchema = z.object({
  name:     z.string().min(2, "Organization name must be at least 2 characters"),
  industry: z.string().optional().nullable(),
  website:  z.string().url("Enter a valid URL").optional().or(z.literal("")).nullable(),
  size:     z.coerce.number().optional().nullable(),
});

export async function updateOrganization(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!["ORG_ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return { success: false, error: "Only org admins can update organization settings" };
  }

  const parsed = OrgSchema.safeParse({
    name:     formData.get("name") ?? "",
    industry: (formData.get("industry") as string) || null,
    website:  (formData.get("website") as string) || null,
    size:     (formData.get("size") as string) || null,
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.organization.update({
    where: { id: user.organizationId },
    data: {
      name:     parsed.data.name,
      industry: parsed.data.industry,
      website:  parsed.data.website || null,
      size:     parsed.data.size,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true, message: "Organization updated successfully" };
}

// ── UPDATE NOTIFICATION PREFERENCES ──────────────────────────
export async function updateNotificationPreferences(
  preferences: {
    emailNotifications: boolean;
    weeklyDigest:       boolean;
    okrRiskAlerts:      boolean;
    progressReminders:  boolean;
    reviewReminders:    boolean;
  }
): Promise<ActionResult> {
  const user = await getCurrentUser();

  await prisma.userPreference.upsert({
    where:  { userId: user.id },
    create: { userId: user.id, theme: "SYSTEM", ...preferences },
    update: preferences,
  });

  revalidatePath("/settings");
  return { success: true, message: "Notification preferences saved" };
}

// ── DELETE ACCOUNT ────────────────────────────────────────────
export async function deleteAccount(password: string): Promise<ActionResult> {
  const user = await getCurrentUser();

  const dbUser = await prisma.user.findUnique({
    where:  { id: user.id },
    select: { password: true, role: true },
  });

  if (!dbUser?.password) return { success: false, error: "Cannot verify identity" };

  const valid = await bcrypt.compare(password, dbUser.password);
  if (!valid) return { success: false, error: "Incorrect password" };

  if (dbUser.role === "ORG_ADMIN") {
    return { success: false, error: "Org admins cannot delete their account. Transfer ownership first." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data:  { isActive: false, email: `deleted_${user.id}@deleted.com` },
  });

  return { success: true, message: "Account deleted" };
}