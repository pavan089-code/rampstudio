"use client";

import { BarChart3, CalendarCheck, Clock3, Handshake } from "lucide-react";
import Link from "next/link";

import { AdminSkeleton, EmptyState, ErrorState } from "@/components/admin/AdminSkeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { useBookingAnalytics, useBookings } from "@/hooks/useBookings";

function formatDate(value: Date | null) {
  if (!value) return "Pending";

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { bookings, loading, error } = useBookings();
  const analytics = useBookingAnalytics(bookings);
  const recentBookings = bookings.slice(0, 6);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Leads"
            value={analytics.totalLeads}
            icon={BarChart3}
            detail="All Firestore booking records"
          />
          <StatsCard
            title="New Leads"
            value={analytics.newLeads}
            icon={Clock3}
            detail="Awaiting first response"
          />
          <StatsCard
            title="Contacted Leads"
            value={analytics.contactedLeads}
            icon={Handshake}
            detail="Follow-up started"
          />
          <StatsCard
            title="Booked Leads"
            value={analytics.bookedLeads}
            icon={CalendarCheck}
            detail="Confirmed events"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatsCard title="This Month Leads" value={analytics.thisMonthLeads} icon={Clock3} />
          <StatsCard title="Completed Shoots" value={analytics.completedShoots} icon={CalendarCheck} />
          <StatsCard title="Conversion Rate" value={`${analytics.conversionRate}%`} icon={BarChart3} />
          <StatsCard title="Active Pipeline" value={analytics.contactedLeads + bookings.filter((item) => item.status === "negotiation").length} icon={Handshake} />
          <StatsCard title="Total Leads" value={analytics.totalLeads} icon={BarChart3} />
        </section>

        {error && <ErrorState message={error} />}

        <section className="border border-white/10 bg-white/[0.025] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                Recent Leads
              </p>
              <h2 className="mt-2 font-serif text-3xl text-white">
                Latest inquiries
              </h2>
            </div>
            <Link
              href="/admin/bookings"
              className="w-fit border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)]"
            >
              View all
            </Link>
          </div>

          <div className="mt-6">
            {loading && <AdminSkeleton rows={4} />}
            {!loading && recentBookings.length === 0 && (
              <EmptyState
                title="No bookings yet"
                message="New inquiries submitted from the public booking forms will appear here."
              />
            )}
            {!loading && recentBookings.length > 0 && (
              <div className="divide-y divide-white/10">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="grid gap-3 py-4 transition hover:bg-white/[0.025] sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-medium text-white">{booking.name}</p>
                      <p className="mt-1 text-sm text-white/50">
                        {booking.email} | {booking.phone}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                    <span className="text-sm text-white/45">
                      {formatDate(booking.createdAt?.toDate() || null)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

