"use client";

import { Copy, Mail, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

import {
  createWhatsAppLink,
  generateWhatsAppConfirmationMessage,
} from "@/lib/whatsapp";
import type { Booking } from "@/types/booking";
import type { ConfirmationAction } from "@/types/notifications";

type ConfirmationActionsProps = {
  booking: Booking;
  onCompleted: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => Promise<void>;
};

export async function sendBookingConfirmationRequest(
  bookingId: string,
  action: ConfirmationAction
) {
  const response = await fetch(`/api/admin/bookings/${bookingId}/confirmation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Unable to send confirmation.");
  }

  return payload as {
    success: boolean;
    whatsappMessage: string;
    whatsappUrl: string;
  };
}

export default function BookingConfirmationActions({
  booking,
  onCompleted,
  onError,
  onRefresh,
}: ConfirmationActionsProps) {
  const [busyAction, setBusyAction] = useState<ConfirmationAction | "copy" | "">(
    ""
  );

  const whatsappMessage = generateWhatsAppConfirmationMessage(booking);

  const runAction = async (
    action: ConfirmationAction,
    successMessage: string
  ) => {
    setBusyAction(action);

    try {
      const result = await sendBookingConfirmationRequest(booking.id, action);

      if (action === "prepare-whatsapp") {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }

      await onRefresh();
      onCompleted(successMessage);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to complete notification action."
      );
    } finally {
      setBusyAction("");
    }
  };

  const copyMessage = async () => {
    setBusyAction("copy");

    try {
      await navigator.clipboard.writeText(whatsappMessage);
      onCompleted("WhatsApp message copied.");
    } catch {
      onError("Unable to copy WhatsApp message.");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <section className="border border-white/10 bg-white/[0.025] p-5">
      <h3 className="font-serif text-3xl text-white">
        Booking Confirmation
      </h3>
      <p className="mt-3 text-sm leading-7 text-white/50">
        Confirmation is sent once automatically when the status becomes booked.
        Manual resend controls remain available for admin follow-up.
      </p>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() =>
            runAction("send-confirmation", "Confirmation sent successfully.")
          }
          disabled={Boolean(busyAction) || booking.confirmationSent}
          className="flex min-h-11 items-center justify-center gap-2 border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-4 py-3 text-sm font-medium text-black transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Send className="h-4 w-4" />
          {busyAction === "send-confirmation"
            ? "Sending"
            : booking.confirmationSent
              ? "Confirmation Sent"
              : "Send Confirmation"}
        </button>

        <button
          type="button"
          onClick={() => runAction("resend-email", "Email resent successfully.")}
          disabled={Boolean(busyAction)}
          className="flex min-h-11 items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Mail className="h-4 w-4" />
          {busyAction === "resend-email" ? "Sending" : "Resend Email"}
        </button>

        <button
          type="button"
          onClick={() =>
            runAction("prepare-whatsapp", "WhatsApp confirmation prepared.")
          }
          disabled={Boolean(busyAction)}
          className="flex min-h-11 items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:border-emerald-400/40 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <MessageCircle className="h-4 w-4" />
          {busyAction === "prepare-whatsapp" ? "Opening" : "Open WhatsApp"}
        </button>

        <button
          type="button"
          onClick={copyMessage}
          disabled={Boolean(busyAction)}
          className="flex min-h-11 items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Copy className="h-4 w-4" />
          {busyAction === "copy" ? "Copying" : "Copy WhatsApp Message"}
        </button>
      </div>
    </section>
  );
}
