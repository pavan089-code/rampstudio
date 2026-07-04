import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebase-admin";
import type { BookingFormInput } from "@/types/booking";

export const runtime = "nodejs";

const MAX_LENGTHS = {
  name: 120,
  email: 254,
  phone: 40,
  eventType: 80,
  location: 300,
  package: 120,
  message: 3000,
} as const;

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as Partial<BookingFormInput>;
    const name = cleanString(input.name, MAX_LENGTHS.name);
    const email = cleanString(input.email, MAX_LENGTHS.email).toLowerCase();
    const phone = cleanString(input.phone, MAX_LENGTHS.phone);
    const eventType = cleanString(input.eventType, MAX_LENGTHS.eventType);
    const location = cleanString(input.location, MAX_LENGTHS.location);
    const packageName = cleanString(input.package, MAX_LENGTHS.package);
    const message = cleanString(input.message, MAX_LENGTHS.message);
    const eventDate = input.eventDate ? new Date(input.eventDate) : null;

    if (
      !name ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      phone.replace(/\D/g, "").length < 10 ||
      !eventType ||
      !location ||
      !packageName ||
      (eventDate && Number.isNaN(eventDate.getTime()))
    ) {
      return NextResponse.json({ error: "Invalid booking inquiry." }, { status: 400 });
    }

    const bookings = getAdminDb().collection("bookings");
    const [emailMatch, phoneMatch] = await Promise.all([
      bookings.where("email", "==", email).limit(1).get(),
      bookings.where("phone", "==", phone).limit(1).get(),
    ]);

    if (emailMatch.empty && phoneMatch.empty) {
      const now = FieldValue.serverTimestamp();
      await bookings.add({
        name,
        email,
        phone,
        eventType,
        eventDate: eventDate ? Timestamp.fromDate(eventDate) : null,
        location,
        package: packageName,
        message,
        status: "new",
        createdAt: now,
        updatedAt: now,
        statusHistory: [],
        confirmationSent: false,
        confirmationSentAt: null,
        emailSent: false,
        emailSentAt: null,
        whatsappSent: false,
        whatsappSentAt: null,
        bookingConfirmedAt: null,
      });
    }

    return NextResponse.json({ accepted: true });
  } catch (error) {
    console.error("[api/bookings] Submission failed", {
      code:
        error instanceof Error && "code" in error
          ? String(error.code)
          : undefined,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Unable to submit booking." }, { status: 500 });
  }
}
