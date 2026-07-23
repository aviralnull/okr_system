// src/app/api/razorpay/cancel/route.ts
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { getSession }   from "@/lib/session";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId }, select: { organizationId: true, role: true },
    });
    if (!user || !["ORG_ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sub = await prisma.subscription.findFirst({
      where: { organizationId: user.organizationId, active: true }, select: { id: true },
    });
    if (!sub) return NextResponse.json({ error: "No active subscription" }, { status: 404 });

    await prisma.subscription.update({
      where: { id: sub.id },
      data:  { cancelAtPeriodEnd: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}