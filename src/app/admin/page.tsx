import { redirect } from "next/navigation";

import { requireAdminRole, requireAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const token = await requireAdminSession();
  await requireAdminRole(token);

  redirect("/admin/dashboard");
}
