// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { Resend }       from "resend";
import crypto           from "crypto";
import { sendForgotPasswordEmail } from "@/lib/send-emails";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where:  { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset_${email}` },
    });

    // Create reset token — valid for 1 hour
    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: `reset_${email}`,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // await resend.emails.send({
    //   from:    process.env.RESEND_FROM_EMAIL ?? "OKR Desk <noreply@okrdesk.com>",
    //   to:      email,
    //   subject: "Reset your OKR Desk password",
    //   html: `
    //     <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
    //       <h2 style="color:#6366f1;margin-bottom:8px">Reset your password</h2>
    //       <p style="color:#64748b;margin-bottom:24px">Hi ${user.name}, click the button below to reset your password. This link expires in 1 hour.</p>
    //       <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
    //         Reset Password
    //       </a>
    //       <p style="color:#94a3b8;font-size:12px;margin-top:24px">
    //         If you didn't request this, ignore this email.<br>
    //         Or paste this link: ${resetUrl}
    //       </p>
    //     </div>
    //   `,
    // });

    await sendForgotPasswordEmail({
  to:         email,
  userName:   user.name,
  resetToken: token,
});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}