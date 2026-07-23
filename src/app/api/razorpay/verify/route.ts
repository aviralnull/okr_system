// src/app/api/razorpay/verify/route.ts
import { NextResponse } from "next/server";
import crypto           from "crypto";
import { prisma }       from "@/lib/prisma";
import { getSession }   from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      razorpay_order_id, razorpay_payment_id,
      razorpay_signature, plan,
      //  organizationId,
    } = await req.json();
   const user = await prisma.user.findUnique({
  where: { id: session.userId },
  select: { organizationId: true },
});

if (!user) {
  return NextResponse.json(
    { error: "User not found" },
    { status: 404 }
  );
}

const organizationId = user.organizationId;
    // Verify signature
    const body     = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body).digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // ✅ Schema uses: stripeSubId, stripeCustomerId, active (not status)
    const existing = await prisma.subscription.findFirst({
      where: { organizationId }, select: { id: true },
    });

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          plan,
          active:           true,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          stripeSubId:      razorpay_payment_id,  // reuse for razorpay payment id
          stripeCustomerId: razorpay_order_id,    // reuse for razorpay order id
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          organizationId,
          plan,
          active:           true,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          stripeSubId:      razorpay_payment_id,
          stripeCustomerId: razorpay_order_id,
        },
      });
    }

    await prisma.notification.create({
      data: {
        title:          `🎉 Upgraded to ${plan} plan`,
        message:        `Your organization is now on ${plan}. All features unlocked!`,
        type:           "SYSTEM",
        userId:         session.userId,
        organizationId,
        link:           "/settings",
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}