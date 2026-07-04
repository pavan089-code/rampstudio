import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
