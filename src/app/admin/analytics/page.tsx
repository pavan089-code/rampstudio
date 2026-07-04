"use client";

import { BarChart3, CalendarCheck, CheckCircle2, Percent, Users } from "lucide-react";

import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import { useBookingAnalytics, useBookings } from "@/hooks/useBookings";

export default function AnalyticsPage() {
  const { bookings, loading } = useBookings();
  const analytics = useBookingAnalytics(bookings);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            Analytics
          </p>
          <h2 className="mt-2 font-serif text-4xl text-white">
            Studio Performance
          </h2>
        </div>

        {loading ? (
          <AdminSkeleton rows={5} />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatsCard title="Total Leads" value={analytics.totalLeads} icon={Users} />
            <StatsCard title="This Month Leads" value={analytics.thisMonthLeads} icon={BarChart3} />
            <StatsCard title="Booked Leads" value={analytics.bookedLeads} icon={CalendarCheck} />
            <StatsCard title="Completed Shoots" value={analytics.completedShoots} icon={CheckCircle2} />
            <StatsCard title="Conversion Rate" value={`${analytics.conversionRate}%`} icon={Percent} />
          </section>
        )}
      </div>
    </AdminLayout>
  );
}

