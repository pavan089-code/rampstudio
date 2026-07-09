import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type FirestoreError,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type {
  Booking,
  BookingFormInput,
  BookingStatus,
  LeadNote,
  StatusHistoryItem,
} from "@/types/booking";
import type { BookingNotification } from "@/types/notifications";

const bookingsCollection = collection(db, "bookings");

export function normalizeBooking(id: string, data: Record<string, unknown>): Booking {
  return {
    id,
    name: String(data.name || ""),
    email: String(data.email || ""),
    phone: String(data.phone || ""),
    eventType: String(data.eventType || ""),
    eventDate: (data.eventDate as Timestamp | null) || null,
    location: String(data.location || ""),
    package: String(data.package || ""),
    message: String(data.message || ""),
    status: (data.status as BookingStatus) || "new",
    createdAt: (data.createdAt as Timestamp | null) || null,
    updatedAt: (data.updatedAt as Timestamp | null) || null,
    statusHistory: (data.statusHistory as StatusHistoryItem[]) || [],
    confirmationSent: Boolean(data.confirmationSent),
    confirmationSentAt: (data.confirmationSentAt as Timestamp | null) || null,
    emailSent: Boolean(data.emailSent),
    emailSentAt: (data.emailSentAt as Timestamp | null) || null,
    whatsappSent: Boolean(data.whatsappSent),
    whatsappSentAt: (data.whatsappSentAt as Timestamp | null) || null,
    bookingConfirmedAt: (data.bookingConfirmedAt as Timestamp | null) || null,
  };
}

export async function createBooking(input: BookingFormInput) {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Unable to submit this booking inquiry.");
  }

  return response.json() as Promise<{ accepted: true }>;
}

type FirestoreSubscriptionErrorHandler = (error: FirestoreError) => void;

export function subscribeToBookings(
  onNext: (bookings: Booking[]) => void,
  onError?: FirestoreSubscriptionErrorHandler
) {
  const bookingsQuery = query(bookingsCollection, orderBy("createdAt", "desc"));

  return onSnapshot(bookingsQuery, (snapshot) => {
    onNext(snapshot.docs.map((item) => normalizeBooking(item.id, item.data())));
  }, onError);
}

export function subscribeToRecentBookings(
  count: number,
  onNext: (bookings: Booking[]) => void,
  onError?: FirestoreSubscriptionErrorHandler
) {
  const bookingsQuery = query(
    bookingsCollection,
    orderBy("createdAt", "desc"),
    limit(count)
  );

  return onSnapshot(bookingsQuery, (snapshot) => {
    onNext(snapshot.docs.map((item) => normalizeBooking(item.id, item.data())));
  }, onError);
}

export async function getBookingById(id: string) {
  const snapshot = await getDoc(doc(db, "bookings", id));

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeBooking(snapshot.id, snapshot.data());
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const bookingRef = doc(db, "bookings", id);
  const snapshot = await getDoc(bookingRef);
  const existingHistory =
    snapshot.exists() && Array.isArray(snapshot.data().statusHistory)
      ? snapshot.data().statusHistory
      : [];

  await updateDoc(bookingRef, {
    status,
    updatedAt: serverTimestamp(),
    statusHistory: [
      ...existingHistory,
      {
        status,
        changedAt: Timestamp.now(),
      },
    ],
  });
}

export function subscribeToNotes(
  bookingId: string,
  onNext: (notes: LeadNote[]) => void,
  onError?: FirestoreSubscriptionErrorHandler
) {
  const notesQuery = query(
    collection(db, "bookings", bookingId, "notes"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(notesQuery, (snapshot) => {
    onNext(
      snapshot.docs.map((item) => ({
        id: item.id,
        content: String(item.data().content || ""),
        createdAt: (item.data().createdAt as Timestamp | null) || null,
      }))
    );
  }, onError);
}

export async function addLeadNote(bookingId: string, content: string) {
  return addDoc(collection(db, "bookings", bookingId, "notes"), {
    content: content.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function updateLeadNote(
  bookingId: string,
  noteId: string,
  content: string
) {
  return updateDoc(doc(db, "bookings", bookingId, "notes", noteId), {
    content: content.trim(),
  });
}

export async function deleteLeadNote(bookingId: string, noteId: string) {
  return deleteDoc(doc(db, "bookings", bookingId, "notes", noteId));
}

export function subscribeToNotifications(
  bookingId: string,
  onNext: (notifications: BookingNotification[]) => void,
  onError?: FirestoreSubscriptionErrorHandler
) {
  const notificationsQuery = query(
    collection(db, "bookings", bookingId, "notifications"),
    orderBy("sentAt", "desc")
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    onNext(
      snapshot.docs.map((item) => ({
        id: item.id,
        type: item.data().type,
        status: item.data().status,
        sentAt: (item.data().sentAt as Timestamp | null) || null,
        message: String(item.data().message || ""),
      }))
    );
  }, onError);
}

export async function markWhatsAppOpened(bookingId: string, message: string) {
  const timestamp = serverTimestamp();

  await Promise.all([
    setDoc(
      doc(db, "bookings", bookingId),
      {
        whatsappSent: true,
        whatsappSentAt: timestamp,
        updatedAt: timestamp,
      },
      { merge: true }
    ),
    addDoc(collection(db, "bookings", bookingId, "notifications"), {
      type: "whatsapp",
      status: "success",
      sentAt: timestamp,
      message,
    }),
  ]);
}
