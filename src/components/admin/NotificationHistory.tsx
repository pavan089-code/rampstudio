"use client";

import { useEffect, useState } from "react";

import { subscribeToNotifications } from "@/lib/bookings";
import type { BookingNotification } from "@/types/notifications";

function formatDate(value: BookingNotification["sentAt"]) {
  if (!value) return "Pending";

  return value.toDate().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationHistory({
  bookingId,
}: {
  bookingId: string;
}) {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);

  useEffect(() => {
    return subscribeToNotifications(bookingId, setNotifications);
  }, [bookingId]);

  return (
    <section className="border border-white/10 bg-white/[0.025] p-5">
      <h3 className="font-serif text-3xl text-white">
        Notification History
      </h3>

      <div className="mt-5 space-y-3">
        {notifications.length === 0 && (
          <p className="border border-white/10 bg-black/20 p-4 text-sm text-white/50">
            No notification activity yet.
          </p>
        )}

        {notifications.map((notification) => (
          <article
            key={notification.id}
            className="border border-white/10 bg-black/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.16em] text-[var(--accent-gold)]">
                {notification.type}
              </span>
              <span
                className={`border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${
                  notification.status === "success"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-red-400/30 bg-red-400/10 text-red-200"
                }`}
              >
                {notification.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {notification.message}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/35">
              {formatDate(notification.sentAt)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

