import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";
import { getAdminAuth } from "@/lib/firebase-admin";
import { assertAdminRole } from "@/lib/rbac-admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  if (isLoginRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionCookie) {
    try {
      const token = await getAdminAuth().verifySessionCookie(sessionCookie, true);
      await assertAdminRole(token.uid);
      return NextResponse.next();
    } catch {
      // Invalid, expired, or revoked sessions are cleared below.
    }
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  const response = NextResponse.redirect(loginUrl);

  if (sessionCookie) {
    response.cookies.delete(ADMIN_SESSION_COOKIE);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
