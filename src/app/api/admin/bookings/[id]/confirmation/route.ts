import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { sendBookingConfirmationEmail } from "@/lib/email/sendBookingConfirmation";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { assertAdminRole } from "@/lib/rbac-admin";
import { defaultStudioSettings } from "@/lib/studioDefaults";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import type { Booking } from "@/types/booking";
import type {
  ConfirmationAction,
  StudioSettings,
} from "@/types/notifications";

async function assertAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new Error("Missing admin token.");
  }

  const decodedToken = await getAdminAuth().verifyIdToken(token);
  await assertAdminRole(decodedToken.uid);
  return decodedToken;
}

async function getSettings() {
  const snapshot = await getAdminDb().doc("settings/studio").get();

  if (!snapshot.exists) {
    return defaultStudioSettings;
  }

  return {
    ...defaultStudioSettings,
    ...snapshot.data(),
  } as StudioSettings;
}

async function logNotification({
  bookingId,
  type,
  status,
  message,
}: {
  bookingId: string;
  type: "email" | "whatsapp";
  status: "success" | "failed";
  message: string;
}) {
  await getAdminDb()
    .collection("bookings")
    .doc(bookingId)
    .collection("notifications")
    .add({
      type,
      status,
      sentAt: FieldValue.serverTimestamp(),
      message,
    });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdmin(request);

    const { id } = await context.params;
    const body = (await request.json()) as { action?: ConfirmationAction };
    const action = body.action || "send-confirmation";
    const bookingRef = getAdminDb().collection("bookings").doc(id);
    const bookingSnapshot = await bookingRef.get();

    if (!bookingSnapshot.exists) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    const booking = {
      id: bookingSnapshot.id,
      ...bookingSnapshot.data(),
    } as Booking;
    const settings = await getSettings();

    if (action === "send-confirmation" && booking.confirmationSent) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: "Confirmation was already sent.",
        },
        { status: 409 }
      );
    }

    const whatsappResult = await sendWhatsAppMessage({ booking, settings });

    if (action === "prepare-whatsapp") {
      await logNotification({
        bookingId: id,
        type: "whatsapp",
        status: whatsappResult.success ? "success" : "failed",
        message: whatsappResult.success
          ? "WhatsApp confirmation opened by admin."
          : whatsappResult.message,
      });

      await bookingRef.set(
        {
          whatsappSent: whatsappResult.success,
          whatsappSentAt: whatsappResult.success
            ? FieldValue.serverTimestamp()
            : null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        whatsappMessage: whatsappResult.message,
        whatsappUrl: whatsappResult.link,
      });
    }

    try {
      await sendBookingConfirmationEmail({ booking, settings });
      await logNotification({
        bookingId: id,
        type: "email",
        status: "success",
        message:
          action === "resend-email"
            ? "Booking confirmation email resent."
            : "Booking confirmation email sent.",
      });
    } catch (error) {
      await logNotification({
        bookingId: id,
        type: "email",
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "Booking confirmation email failed.",
      });
      throw error;
    }

    if (action === "send-confirmation") {
      await logNotification({
        bookingId: id,
        type: "whatsapp",
        status: whatsappResult.success ? "success" : "failed",
        message: whatsappResult.success
          ? "WhatsApp confirmation prepared."
          : whatsappResult.message,
      });

      await bookingRef.set(
        {
          confirmationSent: true,
          confirmationSentAt: FieldValue.serverTimestamp(),
          emailSent: true,
          emailSentAt: FieldValue.serverTimestamp(),
          whatsappSent: whatsappResult.success,
          whatsappSentAt: whatsappResult.success
            ? FieldValue.serverTimestamp()
            : null,
          bookingConfirmedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (action === "resend-email") {
      await bookingRef.set(
        {
          emailSent: true,
          emailSentAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({
      success: true,
      whatsappMessage: whatsappResult.message,
      whatsappUrl: whatsappResult.link,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to send confirmation.",
      },
      { status: 500 }
    );
  }
}
