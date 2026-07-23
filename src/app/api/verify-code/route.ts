import { NextResponse }
from "next/server";

import { prisma }
from "@/lib/prisma";

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const {
      email,
      code,
    } = body;

    // VALIDATION

    if (!code) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Email is missing",
        },
        {
          status: 400,
        }
      );
    }

    // FIND USER

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {

      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // ALREADY VERIFIED

    if (
      user.isEmailVerified
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Email already verified",
        },
        {
          status: 400,
        }
      );
    }

    // INVALID CODE

    if (
      user.emailVerificationCode !==
      code
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid verification code",
        },
        {
          status: 400,
        }
      );
    }

    // EXPIRED CODE

    if (
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry <
        new Date()
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code expired",
        },
        {
          status: 400,
        }
      );
    }

    // VERIFY USER

    await prisma.user.update({

      where: {
        id: user.id,
      },

      data: {

        isEmailVerified:
          true,

        emailVerificationCode:
          null,

        emailVerificationExpiry:
          null,
      },
    });

    // SUCCESS RESPONSE

    return NextResponse.json(
      {
        success: true,
        message:
          "Email verified successfully",
      },
      {
        status: 200,
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