"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";
import { deleteAdminSession } from "@/lib/admin-session";
import { getCurrentUserRole } from "@/lib/rbac";
import { isAdminRole, type UserRole } from "@/lib/rbac-types";

export type AdminClientAuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "unauthorized";

export function useAdminClientAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [status, setStatus] = useState<AdminClientAuthStatus>("checking");

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isActive) return;

      setUser(currentUser);
      setRole(null);

      if (!currentUser) {
        setStatus("unauthenticated");
        return;
      }

      setStatus("checking");

      try {
        const currentRole = await getCurrentUserRole(currentUser);
        if (!isActive) return;

        setRole(currentRole);
        setStatus(isAdminRole(currentRole) ? "authenticated" : "unauthorized");
      } catch (error) {
        if (!isActive) return;

        console.error("[admin/auth] Client RBAC check failed", {
          code:
            error instanceof Error && "code" in error
              ? String(error.code)
              : undefined,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        setStatus("unauthorized");
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return {
    user,
    role,
    status,
    loading: status === "checking",
    isAdmin: status === "authenticated",
  };
}

export function useAuthGuard() {
  const router = useRouter();
  const authState = useAdminClientAuth();

  useEffect(() => {
    if (
      authState.status !== "unauthenticated" &&
      authState.status !== "unauthorized"
    ) {
      return;
    }

    void deleteAdminSession();
    router.replace("/admin/login");
  }, [authState.status, router]);

  return { user: authState.user, loading: authState.loading };
}

export function useLogout() {
  const router = useRouter();

  return async () => {
    await Promise.allSettled([signOut(auth), deleteAdminSession()]);
    router.replace("/admin/login");
    router.refresh();
  };
}
