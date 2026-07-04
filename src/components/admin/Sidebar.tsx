"use client";

import {
  BarChart3,
  CalendarCheck,
  CalendarHeart,
  LayoutDashboard,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLogout } from "@/hooks/useAuth";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/events", label: "Events", icon: CalendarHeart },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/70 transition md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#080808] p-6 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin/dashboard" className="block">
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--accent-gold)]">
              Ramp Studio
            </span>
            <span className="mt-2 block font-serif text-2xl text-white">
              Admin CRM
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/70 md:hidden"
            aria-label="Close admin menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-12 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 border px-4 py-3 text-sm transition ${
                  active
                    ? "border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 text-white"
                    : "border-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-auto flex items-center gap-3 border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>
    </>
  );
}
