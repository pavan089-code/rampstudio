import type { Timestamp } from "firebase/firestore";

export const BOOKING_STATUSES = [
  "new",
  "contacted",
  "negotiation",
  "booked",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: Timestamp | null;
  location: string;
  package: string;
  message: string;
  status: BookingStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  statusHistory?: StatusHistoryItem[];
  confirmationSent: boolean;
  confirmationSentAt: Timestamp | null;
  emailSent: boolean;
  emailSentAt: Timestamp | null;
  whatsappSent: boolean;
  whatsappSentAt: Timestamp | null;
  bookingConfirmedAt: Timestamp | null;
};

export type BookingFormInput = {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: Date | null;
  location: string;
  package: string;
  message: string;
};

export type StatusHistoryItem = {
  status: BookingStatus;
  changedAt: Timestamp;
};

export type LeadNote = {
  id: string;
  content: string;
  createdAt: Timestamp | null;
};
