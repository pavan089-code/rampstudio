import type { Timestamp } from "firebase/firestore";

export type StudioSettings = {
  studioName: string;
  studioEmail: string;
  studioPhone: string;
  whatsappNumber: string;
  instagramUrl: string;
  websiteUrl: string;
};

export type NotificationType = "email" | "whatsapp";
export type NotificationStatus = "success" | "failed";

export type BookingNotification = {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  sentAt: Timestamp | null;
  message: string;
};

export type ConfirmationAction =
  | "send-confirmation"
  | "resend-email"
  | "prepare-whatsapp";

