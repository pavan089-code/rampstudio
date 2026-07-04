"use client";

import { Menu } from "lucide-react";

export default function AdminNavbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b0c]/95 px-5 py-4 backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/70 md:hidden"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Client Relationship Management
          </p>
          <h1 className="mt-1 font-serif text-2xl text-white md:text-3xl">
            Studio Leads
          </h1>
        </div>

        <div className="hidden border border-[var(--accent-gold)]/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--accent-gold)] sm:block">
          Admin
        </div>
      </div>
    </header>
  );
}

