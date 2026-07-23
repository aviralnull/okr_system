"use server";

import { prisma }         from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { success: true;  message?: string }
  | { success: false; error: string };

// ── GET NOTIFICATIONS ─────────────────────────────────────────
export async function getNotifications(userId: string, organizationId: string) {
  return prisma.notification.findMany({
    where:   { userId, organizationId },
    orderBy: { createdAt: "desc" },
    take:    50,
    select: {
      id: true, title: true, message: true,
      type: true, isRead: true, link: true, createdAt: true,
    },
  });
}

export type NotificationItem = Awaited<ReturnType<typeof getNotifications>>[number];

// ── GET UNREAD COUNT ──────────────────────────────────────────
export async function getUnreadCount(userId: string, organizationId: string) {
  return prisma.notification.count({
    where: { userId, organizationId, isRead: false },
  });
}

// ── MARK SINGLE AS READ ───────────────────────────────────────
export async function markAsRead(notificationId: string): Promise<ActionResult> {
  const user = await getCurrentUser();

  const notif = await prisma.notification.findFirst({
    where: { id: notificationId, userId: user.id },
  });
  if (!notif) return { success: false, error: "Notification not found" };

  await prisma.notification.update({
    where: { id: notificationId },
    data:  { isRead: true },
  });

  revalidatePath("/notifications");
  return { success: true };
}

// ── MARK ALL AS READ ──────────────────────────────────────────
export async function markAllAsRead(): Promise<ActionResult> {
  const user = await getCurrentUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, organizationId: user.organizationId, isRead: false },
    data:  { isRead: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { success: true, message: "All notifications marked as read" };
}

// ── DELETE SINGLE ─────────────────────────────────────────────
export async function deleteNotification(notificationId: string): Promise<ActionResult> {
  const user = await getCurrentUser();

  const notif = await prisma.notification.findFirst({
    where: { id: notificationId, userId: user.id },
  });
  if (!notif) return { success: false, error: "Notification not found" };

  await prisma.notification.delete({ where: { id: notificationId } });

  revalidatePath("/notifications");
  return { success: true };
}

// ── DELETE ALL READ ───────────────────────────────────────────
export async function clearReadNotifications(): Promise<ActionResult> {
  const user = await getCurrentUser();

  await prisma.notification.deleteMany({
    where: { userId: user.id, organizationId: user.organizationId, isRead: true },
  });

  revalidatePath("/notifications");
  return { success: true, message: "Cleared all read notifications" };
}
