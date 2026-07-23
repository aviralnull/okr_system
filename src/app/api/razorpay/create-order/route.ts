import { NextResponse } from "next/server";
import { razorpay, RAZORPAY_PLANS } from "@/lib/razorpay";
import { getSession }   from "@/lib/session";
import { prisma }       from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await req.json();
    if (!["PRO", "BUSINESS"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where:  { id: session.userId },
      select: { organizationId: true, name: true, email: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const planConfig = RAZORPAY_PLANS[plan];

    const order = await razorpay.orders.create({
      amount:   planConfig.amount,
      currency: "INR",
      receipt:  `okr_${user.organizationId.slice(0, 10)}_${Date.now()}`,
      notes: {
        organizationId: user.organizationId,
        plan,
        userId: session.userId,
      },
    });

    return NextResponse.json({
      orderId:  order.id,
      amount:   planConfig.amount,
      currency: "INR",
      keyId:    process.env.RAZORPAY_KEY_ID,
      name:     planConfig.name,
      userName: user.name,
      email:    user.email,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
