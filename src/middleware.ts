// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify }                 from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

const PUBLIC_ROUTES = [
  "/sign-in",
  "/sign-up",
    "/forgot-password",      
  "/reset-password",       
  "/verify-code",           
   "/api/auth", 
  "/invite",
  "/api/verify-code",    
  "/set-password",
  "/api/sign-in",    // ← YE ZAROORI HAI — public rakho
  "/api/sign-up",
  "/api/webhooks",
  "/_next",
  "/favicon",
];

function isPublic(pathname: string) {
   if (pathname === "/") return true; 
  return PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  // "okr_session" cookie check — same as lib/session.ts
  const token = req.cookies.get("okr_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/sign-in", req.url));
    res.cookies.delete("okr_session");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
