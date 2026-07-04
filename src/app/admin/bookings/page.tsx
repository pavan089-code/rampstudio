"use client";

import { AdminSkeleton, EmptyState, ErrorState } from "@/components/admin/AdminSkeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import BookingTable from "@/components/admin/BookingTable";
import { useBookings } from "@/hooks/useBookings";

export default function BookingsPage() {
  const { bookings, loading, error } = useBookings();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            Bookings
          </p>
          <h2 className="mt-2 font-serif text-4xl text-white">
            Inquiry Pipeline
          </h2>
        </div>

        {error && <ErrorState message={error} />}
        {loading && <AdminSkeleton rows={6} />}
        {!loading && bookings.length === 0 && (
          <EmptyState
            title="No leads found"
            message="Firestore bookings will appear as soon as visitors submit an inquiry."
          />
        )}
        {!loading && bookings.length > 0 && <BookingTable bookings={bookings} />}
      </div>
    </AdminLayout>
  );
}

