import "server-only";

import type { ReactNode } from "react";

import { requireAdminRole, requireAdminSession } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = await requireAdminSession();
  await requireAdminRole(token);

  return children;
}
