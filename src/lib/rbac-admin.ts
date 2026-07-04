import type { DecodedIdToken } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase-admin";
import {
  isAdminRole,
  isUserRole,
  type UserRole,
} from "@/lib/rbac-types";

export class RbacAuthorizationError extends Error {
  readonly code = "auth/insufficient-permission";

  constructor(message = "This account does not have admin access.") {
    super(message);
    this.name = "RbacAuthorizationError";
  }
}

function getBootstrapAdminEmail() {
  return process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase() || null;
}

export async function ensureUserRoleDocument(
  token: DecodedIdToken
): Promise<UserRole> {
  if (!token.email) {
    throw new RbacAuthorizationError(
      "The Firebase account does not have an email address."
    );
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(token.uid);
  const email = token.email.trim().toLowerCase();
  const displayName =
    typeof token.name === "string" && token.name.trim()
      ? token.name.trim()
      : email.split("@")[0];
  const bootstrapEmail = getBootstrapAdminEmail();

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(userRef);

    if (existing.exists) {
      let role = existing.data()?.role;
      if (!isUserRole(role)) {
        throw new RbacAuthorizationError("The account has an invalid RBAC role.");
      }

      if (
        role === "viewer" &&
        bootstrapEmail &&
        email === bootstrapEmail
      ) {
        const existingAdmins = await transaction.get(
          db.collection("users")
            .where("role", "in", ["super_admin", "admin"])
            .limit(1)
        );

        if (existingAdmins.empty) role = "super_admin";
      }

      transaction.update(userRef, {
        email,
        displayName,
        role,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return role;
    }

    const role: UserRole =
      bootstrapEmail && email === bootstrapEmail
        ? "super_admin"
        : "viewer";
    const timestamp = FieldValue.serverTimestamp();

    transaction.create(userRef, {
      uid: token.uid,
      email,
      displayName,
      role,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return role;
  });
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  const snapshot = await getAdminDb().collection("users").doc(uid).get();
  const role = snapshot.data()?.role;
  return isUserRole(role) ? role : null;
}

export async function assertAdminRole(uid: string) {
  const role = await getUserRole(uid);
  if (!isAdminRole(role)) throw new RbacAuthorizationError();
  return role;
}

export { isAdminRole };
