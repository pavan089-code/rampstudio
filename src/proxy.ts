import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  if (isLoginRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
