"use client";

import { ArrowLeft, Calendar, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminSkeleton, EmptyState, ErrorState } from "@/components/admin/AdminSkeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import BookingConfirmationActions, {
  sendBookingConfirmationRequest,
} from "@/components/admin/BookingConfirmationActions";
import LeadNotes from "@/components/admin/LeadNotes";
import NotificationHistory from "@/components/admin/NotificationHistory";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminClientAuth } from "@/hooks/useAuth";
import { getBookingById, updateBookingStatus } from "@/lib/bookings";
import {
  BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/types/booking";

function formatDate(value: Booking["createdAt"], withTime = false) {
  if (!value) return "Pending";

  return value.toDate().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { status } = useAdminClientAuth();

  const refreshBooking = async () => {
    if (status !== "authenticated") return;

    const result = await getBookingById(params.id);
    setBooking(result);
  };

  useEffect(() => {
    if (status === "checking") return;

    if (status !== "authenticated") {
      const timeout = window.setTimeout(() => {
        setBooking(null);
        setLoading(false);
        setError(
          status === "unauthorized"
            ? "This Firebase account does not have admin access."
            : "Please sign in to load this booking."
        );
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    let isMounted = true;

    async function loadBooking() {
      try {
        const result = await getBookingById(params.id);
        if (isMounted) {
          setBooking(result);
          setError("");
        }
      } catch {
        if (isMounted) setError("Unable to load this booking.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBooking();

    return () => {
      isMounted = false;
    };
  }, [params.id, status]);

  const handleStatusChange = async (status: BookingStatus) => {
    if (!booking || status === booking.status) return;

    setIsUpdatingStatus(true);
    setError("");
    setToast("");

    try {
      await updateBookingStatus(booking.id, status);
      if (status === "booked" && !booking.confirmationSent) {
        await sendBookingConfirmationRequest(booking.id, "send-confirmation");
        setToast("Confirmation sent successfully.");
      }
      const freshBooking = await getBookingById(booking.id);
      setBooking(freshBooking);
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update status. Please try again."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Link>

        {error && <ErrorState message={error} />}
        {toast && (
          <div className="border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            {toast}
          </div>
        )}
        {loading && <AdminSkeleton rows={6} />}

        {!loading && !booking && (
          <EmptyState
            title="Booking not found"
            message="This lead may have been removed or the booking id is incorrect."
          />
        )}

        {booking && (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="border border-white/10 bg-white/[0.025] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                      Booking Detail
                    </p>
                    <h2 className="mt-2 font-serif text-4xl text-white">
                      {booking.name}
                    </h2>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <a
                    href={`tel:${booking.phone}`}
                    className="flex items-center gap-3 border border-white/10 p-4 text-white/70"
                  >
                    <Phone className="h-4 w-4 text-[var(--accent-gold)]" />
                    {booking.phone}
                  </a>
                  <a
                    href={`mailto:${booking.email}`}
                    className="flex items-center gap-3 border border-white/10 p-4 text-white/70"
                  >
                    <Mail className="h-4 w-4 text-[var(--accent-gold)]" />
                    {booking.email}
                  </a>
                  <div className="flex items-center gap-3 border border-white/10 p-4 text-white/70">
                    <Calendar className="h-4 w-4 text-[var(--accent-gold)]" />
                    {formatDate(booking.eventDate)}
                  </div>
                  <div className="flex items-center gap-3 border border-white/10 p-4 text-white/70">
                    <MapPin className="h-4 w-4 text-[var(--accent-gold)]" />
                    {booking.location}
                  </div>
                </div>

                <dl className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Event Type
                    </dt>
                    <dd className="mt-2 text-white/75">{booking.eventType}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Package
                    </dt>
                    <dd className="mt-2 text-white/75">{booking.package}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Created At
                    </dt>
                    <dd className="mt-2 text-white/75">
                      {formatDate(booking.createdAt, true)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Updated At
                    </dt>
                    <dd className="mt-2 text-white/75">
                      {formatDate(booking.updatedAt, true)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Confirmation Sent
                    </dt>
                    <dd className="mt-2 text-white/75">
                      {booking.confirmationSent ? "Yes" : "No"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Confirmed At
                    </dt>
                    <dd className="mt-2 text-white/75">
                      {formatDate(booking.bookingConfirmedAt, true)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                    Message
                  </p>
                  <p className="mt-3 whitespace-pre-line border border-white/10 bg-black/20 p-5 text-sm leading-8 text-white/70">
                    {booking.message || "No message provided."}
                  </p>
                </div>
              </div>

              <aside className="space-y-6">
                <BookingConfirmationActions
                  booking={booking}
                  onCompleted={setToast}
                  onError={setError}
                  onRefresh={refreshBooking}
                />

                <section className="border border-white/10 bg-white/[0.025] p-5">
                  <h3 className="font-serif text-3xl text-white">
                    Status Management
                  </h3>
                  <select
                    value={booking.status}
                    onChange={(event) =>
                      handleStatusChange(event.target.value as BookingStatus)
                    }
                    disabled={isUpdatingStatus}
                    className="field-surface mt-5 w-full px-4 py-3 text-sm"
                  >
                    {BOOKING_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <p className="mt-4 text-sm text-white/50">
                    Status changes save to Firestore and update the lead
                    timeline.
                  </p>
                </section>

                <section className="border border-white/10 bg-white/[0.025] p-5">
                  <h3 className="font-serif text-3xl text-white">Timeline</h3>
                  <div className="mt-5 space-y-4">
                    <div className="border-l border-[var(--accent-gold)]/40 pl-4">
                      <p className="text-sm text-white">Lead created</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
                        {formatDate(booking.createdAt, true)}
                      </p>
                    </div>

                    {booking.statusHistory?.map((item, index) => (
                      <div
                        key={`${item.status}-${index}`}
                        className="border-l border-white/15 pl-4"
                      >
                        <p className="text-sm text-white">
                          Status changed to {item.status}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
                          {formatDate(item.changedAt, true)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </section>

            <NotificationHistory bookingId={booking.id} />
            <LeadNotes bookingId={booking.id} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
