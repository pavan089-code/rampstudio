"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";
import { deleteAdminSession } from "@/lib/admin-session";

export function useAuthGuard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        router.replace("/admin/login");
      }
    });

    return unsubscribe;
  }, [router]);

  return { user, loading };
}

export function useLogout() {
  const router = useRouter();

  return async () => {
    await Promise.allSettled([signOut(auth), deleteAdminSession()]);
    router.replace("/admin/login");
    router.refresh();
  };
}
