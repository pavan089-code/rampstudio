import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type Unsubscribe,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import type {
  EventGalleryMedia,
  EventGalleryMediaDocument,
  EventGalleryMediaInput,
  EventGalleryMediaUpdate,
} from "@/types/event";

export const EVENT_GALLERY_COLLECTION = "gallery";
export const EVENT_GALLERY_STORAGE_ROOT = "events";
export const EVENT_GALLERY_MAX_FILE_SIZE = 8 * 1024 * 1024;
export const EVENT_GALLERY_MAX_BATCH_SIZE = 25;
export const EVENT_GALLERY_ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toMillis(value: EventGalleryMediaDocument["uploadedAt"]): number {
  return value?.toMillis() ?? 0;
}

export function sanitizeGalleryFileName(fileName: string): string {
  const sanitized = fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return sanitized || "event-gallery-image";
}

export function getGalleryStoragePath(eventId: string, mediaId: string, fileName: string): string {
  return `${EVENT_GALLERY_STORAGE_ROOT}/${eventId}/${EVENT_GALLERY_COLLECTION}/${mediaId}/${sanitizeGalleryFileName(fileName)}`;
}

export function validateGalleryFiles(files: File[]): string[] {
  const errors: string[] = [];

  if (files.length > EVENT_GALLERY_MAX_BATCH_SIZE) {
    errors.push(`Upload ${EVENT_GALLERY_MAX_BATCH_SIZE} images or fewer at a time.`);
  }

  files.forEach((file) => {
    if (file.size <= 0) errors.push(`${file.name} is empty.`);
    if (file.size > EVENT_GALLERY_MAX_FILE_SIZE) {
      errors.push(`${file.name} is too large. Upload optimized web images under 8 MB each.`);
    }
    if (!EVENT_GALLERY_ALLOWED_CONTENT_TYPES.includes(file.type)) {
      errors.push(`${file.name} is not a supported image type. Use JPEG, PNG, WebP, or AVIF.`);
    }
  });

  return errors;
}

function normalizeGalleryDocument(data: Record<string, unknown>, eventId: string): EventGalleryMediaDocument {
  return {
    eventId: stringValue(data.eventId) || eventId,
    storagePath: stringValue(data.storagePath).trim(),
    downloadUrl: stringValue(data.downloadUrl).trim(),
    fileName: stringValue(data.fileName).trim(),
    contentType: stringValue(data.contentType).trim(),
    size: numberValue(data.size, 0),
    width: numberValue(data.width, 0),
    height: numberValue(data.height, 0),
    caption: stringValue(data.caption).trim(),
    altText: stringValue(data.altText).trim(),
    order: numberValue(data.order, 0),
    visible: booleanValue(data.visible, true),
    downloadEnabled: booleanValue(data.downloadEnabled, false),
    uploadedAt: (data.uploadedAt as EventGalleryMediaDocument["uploadedAt"]) ?? null,
    updatedAt: (data.updatedAt as EventGalleryMediaDocument["updatedAt"]) ?? null,
  };
}

function converterForEvent(eventId: string): FirestoreDataConverter<EventGalleryMediaDocument> {
  return {
    toFirestore(media): DocumentData {
      return media;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): EventGalleryMediaDocument {
      return normalizeGalleryDocument(snapshot.data(options), eventId);
    },
  };
}

function galleryCollection(eventId: string) {
  return collection(db, "events", eventId, EVENT_GALLERY_COLLECTION).withConverter(converterForEvent(eventId));
}

function toGalleryMedia(id: string, data: EventGalleryMediaDocument): EventGalleryMedia {
  return { id, ...data };
}

function sortGalleryMedia(first: EventGalleryMedia, second: EventGalleryMedia): number {
  if (first.order !== second.order) return first.order - second.order;
  const firstTime = toMillis(first.uploadedAt);
  const secondTime = toMillis(second.uploadedAt);
  if (firstTime !== secondTime) return firstTime - secondTime;
  return first.fileName.localeCompare(second.fileName);
}

function prepareInput(eventId: string, input: EventGalleryMediaInput): Omit<EventGalleryMediaDocument, "uploadedAt" | "updatedAt"> {
  return {
    eventId,
    storagePath: input.storagePath.trim(),
    downloadUrl: input.downloadUrl.trim(),
    fileName: input.fileName.trim(),
    contentType: input.contentType.trim(),
    size: input.size,
    width: input.width,
    height: input.height,
    caption: input.caption.trim(),
    altText: input.altText.trim(),
    order: input.order,
    visible: input.visible,
    downloadEnabled: input.downloadEnabled,
  };
}

function prepareUpdate(input: EventGalleryMediaUpdate): EventGalleryMediaUpdate {
  const update: EventGalleryMediaUpdate = {};
  if (typeof input.caption === "string") update.caption = input.caption.trim();
  if (typeof input.altText === "string") update.altText = input.altText.trim();
  if (typeof input.order === "number" && Number.isFinite(input.order)) update.order = input.order;
  if (typeof input.visible === "boolean") update.visible = input.visible;
  if (typeof input.downloadEnabled === "boolean") update.downloadEnabled = input.downloadEnabled;
  return update;
}

function isStorageObjectNotFound(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "storage/object-not-found");
}

async function deleteStorageObject(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    if (!isStorageObjectNotFound(error)) throw error;
  }
}

export const EventGalleryService = {
  createMediaId(eventId: string): string {
    return doc(galleryCollection(eventId)).id;
  },

  subscribe(eventId: string, callback: (media: EventGalleryMedia[]) => void, onError?: (error: Error) => void): Unsubscribe {
    return onSnapshot(
      galleryCollection(eventId),
      (snapshot) => {
        callback(snapshot.docs.map((item) => toGalleryMedia(item.id, item.data())).sort(sortGalleryMedia));
      },
      onError,
    );
  },

  async list(eventId: string): Promise<EventGalleryMedia[]> {
    const snapshot = await getDocs(galleryCollection(eventId));
    return snapshot.docs.map((item) => toGalleryMedia(item.id, item.data())).sort(sortGalleryMedia);
  },

  async create(eventId: string, mediaId: string, input: EventGalleryMediaInput): Promise<void> {
    const prepared = prepareInput(eventId, input);
    if (!prepared.storagePath || !prepared.downloadUrl) throw new Error("Gallery media is missing its uploaded image reference.");
    await setDoc(doc(galleryCollection(eventId), mediaId), {
      ...prepared,
      uploadedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async update(eventId: string, mediaId: string, input: EventGalleryMediaUpdate): Promise<void> {
    const prepared = prepareUpdate(input);
    await updateDoc(doc(galleryCollection(eventId), mediaId), {
      ...prepared,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(eventId: string, media: EventGalleryMedia): Promise<void> {
    await deleteStorageObject(media.storagePath);
    await deleteDoc(doc(galleryCollection(eventId), media.id));
  },

  async deleteAll(eventId: string): Promise<void> {
    const media = await EventGalleryService.list(eventId);
    const storageResults = await Promise.allSettled(media.map((item) => deleteStorageObject(item.storagePath)));
    const failedDeletes = storageResults.filter((result) => result.status === "rejected");
    if (failedDeletes.length > 0) {
      throw new Error(`Unable to delete ${failedDeletes.length} Gallery image${failedDeletes.length === 1 ? "" : "s"} from Storage.`);
    }

    const batch = writeBatch(db);
    media.forEach((item) => batch.delete(doc(galleryCollection(eventId), item.id)));
    await batch.commit();
  },
};
