import type { Booking } from "@/types/booking";
import type { StudioSettings } from "@/types/notifications";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatBookingDate(booking: Pick<Booking, "eventDate">) {
  if (!booking.eventDate) return "To be confirmed";

  return booking.eventDate.toDate().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function generateWhatsAppConfirmationMessage(
  booking: Pick<
    Booking,
    "name" | "eventType" | "eventDate" | "location" | "package"
  >
) {
  return `Hello ${booking.name},

Thank you for choosing Ramp Studio.

We are pleased to confirm your booking.

Booking Details:

Event: ${booking.eventType}
Date: ${formatBookingDate(booking)}
Location: ${booking.location}
Package: ${booking.package}

Our team will contact you shortly regarding planning and shoot coordination.

Thank you,
Ramp Studio`;
}

export function createWhatsAppLink(phone: string, message: string) {
  return `https://wa.me/${onlyDigits(phone)}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppDeliveryResult = {
  success: boolean;
  message: string;
  link: string;
  provider: "wa.me" | "meta";
};

export async function sendWhatsAppMessage({
  booking,
  settings,
}: {
  booking: Pick<
    Booking,
    "name" | "phone" | "eventType" | "eventDate" | "location" | "package"
  >;
  settings: StudioSettings;
}): Promise<WhatsAppDeliveryResult> {
  const message = generateWhatsAppConfirmationMessage(booking);

  if (process.env.WHATSAPP_DELIVERY_PROVIDER === "meta") {
    // Placeholder for Meta WhatsApp Business Cloud API integration.
    // Add WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and template IDs,
    // then call https://graph.facebook.com/vXX.X/{phone-number-id}/messages.
    return {
      success: false,
      message:
        "Meta WhatsApp Business API is not configured yet. wa.me link prepared instead.",
      link: createWhatsAppLink(booking.phone || settings.whatsappNumber, message),
      provider: "meta",
    };
  }

  return {
    success: true,
    message,
    link: createWhatsAppLink(booking.phone || settings.whatsappNumber, message),
    provider: "wa.me",
  };
}

