import type { DecodedIdToken } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase-admin";
import {
  isAdminRole,
  isUserRole,
  type UserRole,
} from "@/lib/rbac-types";

const BOOTSTRAP_MARKER_PATH = "_internal/bootstrap-super-admin";

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
  const email = typeof token.email === "string" ? token.email.trim().toLowerCase() : "";
  if (!email) {
    throw new RbacAuthorizationError(
      "The Firebase account does not have an email address."
    );
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(token.uid);
  const displayName =
    typeof token.name === "string" && token.name.trim()
      ? token.name.trim()
      : email.split("@")[0];
  const bootstrapEmail = getBootstrapAdminEmail();
  const canBootstrap =
    token.email_verified === true && email === bootstrapEmail;

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(userRef);

    if (existing.exists) {
      const role = existing.data()?.role;
      if (!isUserRole(role)) {
        throw new RbacAuthorizationError("The account has an invalid RBAC role.");
      }

      transaction.update(userRef, {
        email,
        displayName,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return role;
    }

    let role: UserRole = "viewer";
    const marker = db.doc(BOOTSTRAP_MARKER_PATH);
    if (canBootstrap && !(await transaction.get(marker)).exists) {
      const existingAdmins = await transaction.get(
        db.collection("users")
          .where("role", "in", ["super_admin", "admin"])
          .limit(1)
      );
      if (existingAdmins.empty) role = "super_admin";
    }

    const timestamp = FieldValue.serverTimestamp();
    if (role === "super_admin") {
      // Create the marker atomically so concurrent requests cannot bootstrap twice.
      transaction.create(marker, { uid: token.uid, createdAt: timestamp });
    }

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
