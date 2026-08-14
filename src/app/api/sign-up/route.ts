import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import VerifyEmail
from "@/emails/VerificatinEmail"


import { resend } from "@/lib/resend";
import { sendVerificationEmail } from "@/lib/send-emails";
export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      name,
      email,
      password,

      organizationName,
      industry,
      website,
      size,
    } = body;

    if (
      !name ||
      !email ||
      !password ||
      !organizationName ||
      !industry ||
      !size
    ) {

      return NextResponse.json(
        {
          success: false,
          message: "All required fields are missing",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {

      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        {
          status: 400,
        }
      );
    }

    const slug =
      organizationName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const existingOrganization =
      await prisma.organization.findUnique({
        where: {
          slug,
        },
      });

    if (existingOrganization) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Organization already exists",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);
const verificationCode =
  Math.floor(
    100000 +
    Math.random() * 900000
  ).toString();

const verificationExpiry =
  new Date(
    Date.now() +
    1000 * 60 * 10
  );
    const organization =
      await prisma.organization.create({
        data: {
          name: organizationName,

          slug,

          industry,

          website,

          size: Number(size),
        },
      });

    const user =
      await prisma.user.create({
        data: {
          name,

          email,
          isEmailVerified: false,
          emailVerificationCode:verificationCode,
          emailVerificationExpiry:verificationExpiry,
          password: hashedPassword,

          role: "ORG_ADMIN",

          organizationId:
            organization.id,
        },
      });

  sendVerificationEmail({
  to: email,
  userName: name,
  otp: verificationCode,
}).catch((err) =>
  console.error("Verification email failed:", err)
);

//    await resend.emails.send({

//   from:
//     "onboarding@resend.dev",

//   to: email,

//   subject:
//     "Email Verification Code",

//   react: VerifyEmail({
//     name,
//     code: verificationCode,
//   }),
// });



    return NextResponse.json(
      {
        success: true,

        message:
          "Organization created successfully",

        user,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}