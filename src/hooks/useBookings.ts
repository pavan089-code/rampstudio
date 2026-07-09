"use client";

import { useEffect, useMemo, useState } from "react";

import { subscribeToBookings } from "@/lib/bookings";
import { useAdminClientAuth } from "@/hooks/useAuth";
import type { Booking, BookingStatus } from "@/types/booking";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { status } = useAdminClientAuth();

  useEffect(() => {
    if (status === "checking") return;

    if (status !== "authenticated") {
      const timeout = window.setTimeout(() => {
        setBookings([]);
        setLoading(false);
        setError(
          status === "unauthorized"
            ? "This Firebase account does not have admin access."
            : "Please sign in to load admin bookings."
        );
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    const unsubscribe = subscribeToBookings(
      (items) => {
        setBookings(items);
        setError("");
        setLoading(false);
      },
      (firestoreError) => {
        console.error("[admin/bookings] Firestore listener failed", {
          code: firestoreError.code,
          message: firestoreError.message,
        });
        setError("Unable to load bookings from Firestore.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [status]);

  useEffect(() => {
    if (!loading) return;

    const timeout = window.setTimeout(() => {
      setError("");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loading]);

  return { bookings, loading, error };
}

export function useBookingAnalytics(bookings: Booking[]) {
  return useMemo(() => {
    const now = new Date();
    const thisMonth = bookings.filter((booking) => {
      const createdAt = booking.createdAt?.toDate();
      return (
        createdAt &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    });
    const countByStatus = (status: BookingStatus) =>
      bookings.filter((booking) => booking.status === status).length;
    const bookedLeads = countByStatus("booked");
    const completedShoots = countByStatus("completed");
    const converted = bookedLeads + completedShoots;
    const conversionRate =
      bookings.length > 0 ? Math.round((converted / bookings.length) * 100) : 0;

    return {
      totalLeads: bookings.length,
      thisMonthLeads: thisMonth.length,
      newLeads: countByStatus("new"),
      contactedLeads: countByStatus("contacted"),
      bookedLeads,
      completedShoots,
      conversionRate,
    };
  }, [bookings]);
}
