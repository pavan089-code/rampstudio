"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import AdminNavbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import { useAuthGuard } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loading } = useAuthGuard();

  if (loading) {
    return (
      <main className="min-h-screen bg-primary p-6 text-white">
        <div className="mx-auto max-w-4xl pt-24">
          <AdminSkeleton rows={5} />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-white md:grid md:grid-cols-[18rem_1fr]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="min-w-0">
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="px-5 py-8 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

