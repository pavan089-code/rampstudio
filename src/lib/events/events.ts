import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, onSnapshot,
  query, serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import { createEmptyEvent, slugify } from "@/lib/events/config";
import type { EventAnalytics, EventGalleryItem, EventInput, EventRecord, EventRsvp, GuestbookEntry, GuestbookStatus } from "@/types/event";

const eventsCollection = collection(db, "events");
const normalize = (id: string, data: Record<string, unknown>): EventRecord => ({
  ...createEmptyEvent(), ...data, id,
  timeline: Array.isArray(data.timeline) ? data.timeline : [],
  gallery: Array.isArray(data.gallery) ? data.gallery : [],
  sections: { ...createEmptyEvent().sections, ...((data.sections || {}) as object) },
  settings: { ...createEmptyEvent().settings, ...((data.settings || {}) as object) },
  publishedAt: (data.publishedAt as EventRecord["publishedAt"]) || null,
  createdAt: (data.createdAt as EventRecord["createdAt"]) || null,
  updatedAt: (data.updatedAt as EventRecord["updatedAt"]) || null,
} as EventRecord);

export function subscribeToEvents(next: (items: EventRecord[]) => void) {
  return onSnapshot(eventsCollection, (snapshot) => next(snapshot.docs.map((d) => normalize(d.id, d.data())).sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0))));
}
export function subscribeToPublishedEvents(next: (items: EventRecord[]) => void) {
  return onSnapshot(query(eventsCollection, where("status", "==", "published")), (snapshot) => next(snapshot.docs.map((d) => normalize(d.id, d.data()))));
}

export async function getEvent(id: string) {
  const snapshot = await getDoc(doc(db, "events", id));
  return snapshot.exists() ? normalize(snapshot.id, snapshot.data()) : null;
}

export async function getPublishedEventBySlug(slug: string) {
  const snapshot = await getDocs(query(eventsCollection, where("slug", "==", slug), where("status", "==", "published")));
  const item = snapshot.docs[0];
  return item ? normalize(item.id, item.data()) : null;
}

export async function saveEvent(input: EventInput, id?: string) {
  const cleanSlug = slugify(input.slug || input.title);
  const duplicates = await getDocs(query(eventsCollection, where("slug", "==", cleanSlug)));
  if (duplicates.docs.some((item) => item.id !== id)) throw new Error("This event URL is already in use.");
  const payload = { ...input, slug: cleanSlug, updatedAt: serverTimestamp(), publishedAt: input.status === "published" ? serverTimestamp() : null };
  if (id) { await setDoc(doc(db, "events", id), payload, { merge: true }); return id; }
  const created = await addDoc(eventsCollection, { ...payload, createdAt: serverTimestamp() });
  await setDoc(doc(db, "eventAnalytics", created.id), { eventId: created.id, views: 0, uniqueVisitors: 0, galleryViews: 0, rsvpCount: 0, shareCount: 0, livestreamOpens: 0, photoDownloads: 0, sources: {} });
  return created.id;
}

export async function deleteEvent(id: string) {
  const batch = writeBatch(db); batch.delete(doc(db, "events", id)); batch.delete(doc(db, "eventAnalytics", id)); await batch.commit();
}

export async function duplicateEvent(event: EventRecord) {
  const { id: _id, createdAt: _created, updatedAt: _updated, publishedAt: _published, ...input } = event;
  return saveEvent({ ...input, title: `${event.title} Copy`, slug: `${event.slug}-copy`, status: "draft" });
}

export async function uploadEventMedia(
  eventId: string,
  file: File,
  onProgress?: (value: number) => void,
): Promise<Pick<EventGalleryItem, "url" | "storagePath" | "type">> {
  const type: EventGalleryItem["type"] = file.type.startsWith("video/") ? "video" : "image";
  const folder = type === "video" ? "event-videos" : "event-images";
  const storagePath = `${folder}/${eventId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const task = uploadBytesResumable(ref(storage, storagePath), file, { contentType: file.type });
  await new Promise<void>((resolve, reject) => task.on("state_changed", (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)), reject, resolve));
  return { url: await getDownloadURL(task.snapshot.ref), storagePath, type };
}

export async function addGalleryItem(event: EventRecord, item: EventGalleryItem) {
  await updateDoc(doc(db, "events", event.id), { gallery: [...event.gallery, item], updatedAt: serverTimestamp() });
}
export async function removeGalleryItem(event: EventRecord, item: EventGalleryItem) {
  await deleteObject(ref(storage, item.storagePath)).catch(() => undefined);
  await updateDoc(doc(db, "events", event.id), { gallery: event.gallery.filter((x) => x.id !== item.id), updatedAt: serverTimestamp() });
}

export async function submitRsvp(eventId: string, input: Omit<EventRsvp, "id" | "eventId" | "createdAt">) {
  await addDoc(collection(db, "rsvps"), { ...input, eventId, createdAt: serverTimestamp() });
  await trackEvent(eventId, "rsvpCount");
}
export async function submitGuestbook(eventId: string, name: string, message: string) {
  await addDoc(collection(db, "guestbook"), { eventId, name: name.trim(), message: message.trim(), status: "pending", createdAt: serverTimestamp() });
}
export async function getRsvps(eventId: string) { const s = await getDocs(query(collection(db, "rsvps"), where("eventId", "==", eventId))); return s.docs.map((d) => ({ id: d.id, ...d.data() } as EventRsvp)); }
export async function getGuestbook(eventId: string, approvedOnly = false) { const filters = [where("eventId", "==", eventId)]; if (approvedOnly) filters.push(where("status", "==", "approved")); const s = await getDocs(query(collection(db, "guestbook"), ...filters)); return s.docs.map((d) => ({ id: d.id, ...d.data() } as GuestbookEntry)).sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)); }
export async function moderateGuestbook(id: string, status: GuestbookStatus | "delete") { if (status === "delete") return deleteDoc(doc(db, "guestbook", id)); return updateDoc(doc(db, "guestbook", id), { status }); }
export async function getEventAnalytics(eventId: string): Promise<EventAnalytics> { const s = await getDoc(doc(db, "eventAnalytics", eventId)); return { views: 0, uniqueVisitors: 0, galleryViews: 0, rsvpCount: 0, shareCount: 0, livestreamOpens: 0, photoDownloads: 0, sources: {}, ...(s.data() || {}) }; }
export async function trackEvent(eventId: string, metric: keyof Omit<EventAnalytics, "sources">, source?: string) { await fetch(`/api/events/${encodeURIComponent(eventId)}/analytics`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metric, source }) }); }
