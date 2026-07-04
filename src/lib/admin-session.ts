import type { User } from "firebase/auth";

export const ADMIN_SESSION_COOKIE = "ramp_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function createAdminSession(user: User) {
  const tokenResult = await user.getIdTokenResult(true);
  const idToken = tokenResult.token;
  const expiresAt = Date.parse(tokenResult.expirationTime);

  if (!idToken || tokenResult.claims.sub !== user.uid) {
    throw new Error("Firebase returned an invalid ID token for this user.");
  }

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error("Firebase returned an expired ID token.");
  }

  const response = await fetch("/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error || "Unable to create the admin session.");
  }
}

export async function deleteAdminSession() {
  await fetch("/api/admin/session", { method: "DELETE" });
}
