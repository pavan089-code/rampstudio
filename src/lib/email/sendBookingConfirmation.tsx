import { Resend } from "resend";

import BookingConfirmationEmail from "@/components/emails/BookingConfirmationEmail";
import { createWhatsAppLink, formatBookingDate, generateWhatsAppConfirmationMessage } from "@/lib/whatsapp";
import type { Booking } from "@/types/booking";
import type { StudioSettings } from "@/types/notifications";

export async function sendBookingConfirmationEmail({
  booking,
  settings,
}: {
  booking: Booking;
  settings: StudioSettings;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const whatsappMessage = generateWhatsAppConfirmationMessage(booking);
  const whatsappUrl = createWhatsAppLink(booking.phone, whatsappMessage);
  return resend.emails.send({
    from: `${settings.studioName} <${settings.studioEmail}>`,
    to: [booking.email],
    subject: "Your Booking is Confirmed | Ramp Studio",
    react: (
      <BookingConfirmationEmail
        customerName={booking.name}
        eventType={booking.eventType}
        eventDate={formatBookingDate(booking)}
        location={booking.location}
        packageName={booking.package}
        callUrl={`tel:${settings.studioPhone}`}
        whatsappUrl={whatsappUrl}
        settings={settings}
      />
    ),
  });
}
