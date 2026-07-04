import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";
import { getAdminAuth } from "@/lib/firebase-admin";
import { assertAdminRole } from "@/lib/rbac-admin";
import type { UserRole } from "@/lib/rbac-types";

const INVALID_SESSION_ROUTE = "/api/admin/session/clear";

export async function verifyAdminSession(
  sessionCookie?: string | null
): Promise<DecodedIdToken | null> {
  const cookieValue =
    sessionCookie === undefined
      ? (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
      : sessionCookie;

  if (!cookieValue) return null;

  try {
    return await getAdminAuth().verifySessionCookie(cookieValue, true);
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<DecodedIdToken> {
  const token = await verifyAdminSession();

  if (!token) redirect(INVALID_SESSION_ROUTE);

  return token;
}

export async function requireAdminRole(
  token: DecodedIdToken
): Promise<UserRole> {
  try {
    return await assertAdminRole(token.uid);
  } catch {
    redirect(INVALID_SESSION_ROUTE);
  }
}
