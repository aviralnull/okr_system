// src/app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { Resend }       from "resend";
import crypto           from "crypto";
import { sendVerificationEmail } from "@/lib/send-emails";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where:  { email: email.toLowerCase().trim() },
      select: { id: true, name: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    // // Delete existing verify tokens
    // await prisma.verificationToken.deleteMany({
    //   where: { identifier: `verify_${email}` },
    // });

    // Create 6-digit OTP — valid for 15 mins
    const otp     = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // await prisma.verificationToken.create({
    //   data: { identifier: `verify_${email}`, token: otp, expires },
    // });

    await prisma.user.update({
  where: {
    email: email.toLowerCase().trim(),
  },
  data: {
    emailVerificationCode: otp,
    emailVerificationExpiry: expires,
  },
});

    // await resend.emails.send({
    //   from:    process.env.RESEND_FROM_EMAIL ?? "OKR Desk <noreply@okrdesk.com>",
    //   to:      email,
    //   subject: "Your OKR Desk verification code",
    //   html: `
    //     <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
    //       <h2 style="color:#6366f1;margin-bottom:8px">Verify your email</h2>
    //       <p style="color:#64748b;margin-bottom:24px">Hi ${user.name}, use this code to verify your email. It expires in 15 minutes.</p>
    //       <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
    //         <p style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1e293b;margin:0">${otp}</p>
    //       </div>
    //       <p style="color:#94a3b8;font-size:12px">If you didn't request this, ignore this email.</p>
    //     </div>
    //   `,
    // });
    await sendVerificationEmail({
  to:       email,
  userName: user.name,
  otp,
});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}