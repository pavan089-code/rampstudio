"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import SearchFilters from "@/components/admin/SearchFilters";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Booking, BookingStatus } from "@/types/booking";

const PAGE_SIZE = 10;

function formatDate(value: Booking["createdAt"]) {
  if (!value) return "Pending";

  return value.toDate().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BookingTable({ bookings }: { bookings: Booking[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [page, setPage] = useState(1);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !term ||
        booking.name.toLowerCase().includes(term) ||
        booking.phone.toLowerCase().includes(term) ||
        booking.email.toLowerCase().includes(term);
      const matchesStatus = status === "all" || booking.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const visibleBookings = filteredBookings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const updateStatus = (value: "all" | BookingStatus) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <SearchFilters
        search={search}
        status={status}
        onSearchChange={updateSearch}
        onStatusChange={updateStatus}
      />

      <div className="overflow-x-auto border border-white/10">
        <table className="min-w-[980px] w-full border-collapse bg-white/[0.02] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-white/45">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Phone</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Event Type</th>
              <th className="px-4 py-4">Event Date</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Created At</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visibleBookings.map((booking) => (
              <tr key={booking.id} className="text-white/75">
                <td className="px-4 py-4 font-medium text-white">
                  {booking.name}
                </td>
                <td className="px-4 py-4">{booking.phone}</td>
                <td className="px-4 py-4">{booking.email}</td>
                <td className="px-4 py-4">{booking.eventType}</td>
                <td className="px-4 py-4">{formatDate(booking.eventDate)}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-4">{formatDate(booking.createdAt)}</td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center border border-white/10 text-white/70 transition hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)]"
                    aria-label={`View ${booking.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {visibleBookings.length} of {filteredBookings.length} leads
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="border border-white/10 px-4 py-2 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Previous
          </button>
          <span className="px-3">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages}
            className="border border-white/10 px-4 py-2 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

