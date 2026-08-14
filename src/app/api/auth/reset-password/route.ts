// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import bcrypt           from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Find and validate token
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: `reset_${email}`, token },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }
    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { identifier_token: { identifier: `reset_${email}`, token } } });
      return NextResponse.json({ error: "Reset link has expired. Request a new one." }, { status: 400 });
    }

    // Update password
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data:  { password: hashed },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: `reset_${email}`, token } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}