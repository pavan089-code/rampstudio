import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

import { auth, db } from "@/lib/firebase";
import {
  isAdminRole,
  isUserRole,
  type UserRole,
} from "@/lib/rbac-types";

export async function getCurrentUserRole(
  user: User | null = auth.currentUser
): Promise<UserRole | null> {
  if (!user) return null;

  const snapshot = await getDoc(doc(db, "users", user.uid));
  if (!snapshot.exists()) return null;

  const role = snapshot.data().role;
  return isUserRole(role) ? role : null;
}

export async function isAdmin(user?: User | null) {
  return isAdminRole(await getCurrentUserRole(user ?? auth.currentUser));
}

export async function isSuperAdmin(user?: User | null) {
  return (await getCurrentUserRole(user ?? auth.currentUser)) === "super_admin";
}

export async function isPhotographer(user?: User | null) {
  return (await getCurrentUserRole(user ?? auth.currentUser)) === "photographer";
}

export async function isEditor(user?: User | null) {
  return (await getCurrentUserRole(user ?? auth.currentUser)) === "editor";
}

export async function isReceptionist(user?: User | null) {
  return (await getCurrentUserRole(user ?? auth.currentUser)) === "receptionist";
}

export async function isViewer(user?: User | null) {
  return (await getCurrentUserRole(user ?? auth.currentUser)) === "viewer";
}
