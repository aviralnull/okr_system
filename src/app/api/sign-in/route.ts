// import bcrypt from "bcryptjs";

// import jwt from "jsonwebtoken";

// import { cookies } from "next/headers";

// import { NextResponse }
// from "next/server";

// import { prisma }
// from "@/lib/prisma";

// export async function POST(
//   req: Request
// ) {

//   try {

//     const body =
//       await req.json();

//     const {
//       email,
//       password,
//       role,
//     } = body;

//     // VALIDATION

//     if (
//       !email ||
//       !password ||
//       !role
//     ) {

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "All fields are required",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // FIND USER

//     const user =
//       await prisma.user.findUnique({
//         where: {
//           email,
//         },
//       });

//     if (!user) {

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "User not found",
//         },
//         {
//           status: 404,
//         }
//       );
//     }

//     // VERIFY EMAIL

//     if (
//       !user.isEmailVerified
//     ) {

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Please verify your email first",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     // ROLE CHECK

//     if (
//       user.role !== role
//     ) {

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid role selected",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     // PASSWORD CHECK

//     const isPasswordCorrect =
//       await bcrypt.compare(
//         password,
//         user.password
//       );

//     if (
//       !isPasswordCorrect
//     ) {

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid credentials",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     // JWT TOKEN

//     const token =
//       jwt.sign(

//         {
//           id: user.id,

//           email:
//             user.email,

//           role:
//             user.role,
//         },

//         process.env
//           .JWT_SECRET!,

//         {
//           expiresIn: "7d",
//         }
//       );

//     // STORE COOKIE

//     (await cookies()).set(

//       "token",

//       token,

//       {

//         httpOnly: true,

//         secure:
//           process.env
//             .NODE_ENV ===
//           "production",

//         sameSite: "strict",

//         maxAge:
//           60 *
//           60 *
//           24 *
//           7,

//         path: "/",
//       }
//     );

//     // RESPONSE

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Login successful",

//         user: {

//           id: user.id,

//           email:
//             user.email,

//           role:
//             user.role,

//           name:
//             user.name,
//         },
//       },
//       {
//         status: 200,
//       }
//     );

//   } catch (error) {

//     console.log(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Internal Server Error",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }




// app/api/sign-in/route.ts
import bcrypt          from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Account deactivated. Contact your admin." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Use lib/session.ts — sets "okr_session" cookie
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id:    user.id,
        email: user.email,
        role:  user.role,
        name:  user.name,
      },
    });

  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}