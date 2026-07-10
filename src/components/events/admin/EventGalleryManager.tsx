"use client";

import { Download, Edit2, Image as ImageIcon, Loader2, Save, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import type { UploadTaskSnapshot } from "firebase/storage";

import { useAdminClientAuth } from "@/hooks/useAuth";
import { storage } from "@/lib/firebase";
import {
  EventGalleryService,
  EVENT_GALLERY_MAX_BATCH_SIZE,
  EVENT_GALLERY_MAX_FILE_SIZE,
  getGalleryStoragePath,
  validateGalleryFiles,
} from "@/lib/events";
import type { EventGalleryMedia, EventGalleryMediaInput } from "@/types/event";

const inputClass = "field-surface w-full px-4 py-3";
const textareaClass = `${inputClass} min-h-24 resize-y`;

type UploadStatus = {
  id: string;
  fileName: string;
  progress: number;
  state: "uploading" | "saving" | "complete" | "error";
  message: string;
};

type EditState = {
  caption: string;
  altText: string;
  order: string;
  visible: boolean;
  downloadEnabled: boolean;
};

function formatBytes(size: number): string {
  if (!Number.isFinite(size) || size <= 0) return "0 KB";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth || 0, height: image.naturalHeight || 0 });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    image.src = url;
  });
}

function toEditState(media: EventGalleryMedia): EditState {
  return {
    caption: media.caption,
    altText: media.altText,
    order: String(media.order),
    visible: media.visible,
    downloadEnabled: media.downloadEnabled,
  };
}

export default function EventGalleryManager({ eventId }: { eventId: string }) {
  const [media, setMedia] = useState<EventGalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [editingId, setEditingId] = useState("");
  const [editState, setEditState] = useState<EditState | null>(null);
  const { status } = useAdminClientAuth();

  useEffect(() => {
    if (status === "checking") return;

    if (status !== "authenticated") {
      const timeout = window.setTimeout(() => {
        setError("Please sign in to manage Gallery media.");
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    return EventGalleryService.subscribe(eventId, (items) => {
      setMedia(items);
      setError("");
      setLoading(false);
    }, () => {
      setError("Unable to load Gallery media.");
      setLoading(false);
    });
  }, [eventId, status]);

  function setUploadStatus(id: string, update: Partial<UploadStatus>) {
    setUploadStatuses((current) => current.map((item) => item.id === id ? { ...item, ...update } : item));
  }

  async function uploadOne(file: File, order: number): Promise<void> {
    const mediaId = EventGalleryService.createMediaId(eventId);
    const uploadId = `${mediaId}-${file.name}`;
    const storagePath = getGalleryStoragePath(eventId, mediaId, file.name);
    const storageRef = ref(storage, storagePath);

    setUploadStatuses((current) => [...current, { id: uploadId, fileName: file.name, progress: 0, state: "uploading", message: "Uploading" }]);

    try {
      const dimensions = await getImageDimensions(file);
      const snapshot = await new Promise<UploadTaskSnapshot>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
          customMetadata: { eventId, mediaId },
        });

        task.on(
          "state_changed",
          (nextSnapshot) => {
            const progress = nextSnapshot.totalBytes > 0 ? Math.round((nextSnapshot.bytesTransferred / nextSnapshot.totalBytes) * 100) : 0;
            setUploadStatus(uploadId, { progress });
          },
          reject,
          () => resolve(task.snapshot),
        );
      });

      setUploadStatus(uploadId, { state: "saving", message: "Saving details", progress: 100 });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      const input: EventGalleryMediaInput = {
        storagePath,
        downloadUrl,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        caption: "",
        altText: "",
        order,
        visible: true,
        downloadEnabled: false,
      };

      try {
        await EventGalleryService.create(eventId, mediaId, input);
        setUploadStatus(uploadId, { state: "complete", message: "Uploaded" });
      } catch (metadataError) {
        await deleteObject(storageRef).catch(() => undefined);
        throw metadataError;
      }
    } catch (uploadError) {
      setUploadStatus(uploadId, {
        state: "error",
        message: uploadError instanceof Error ? uploadError.message : "Upload failed",
      });
      throw uploadError;
    }
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const validationErrors = validateGalleryFiles(files);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
      return;
    }

    setError("");
    setUploading(true);
    setUploadStatuses([]);
    try {
      for (let index = 0; index < files.length; index += 1) {
        await uploadOne(files[index], media.length + index);
      }
    } catch {
      setError("Some Gallery images could not be uploaded. Completed uploads remain visible above.");
    } finally {
      setUploading(false);
    }
  }

  function startEdit(item: EventGalleryMedia) {
    setEditingId(item.id);
    setEditState(toEditState(item));
  }

  function cancelEdit() {
    setEditingId("");
    setEditState(null);
  }

  async function saveEdit() {
    if (!editingId || !editState) return;

    setError("");
    try {
      await EventGalleryService.update(eventId, editingId, {
        caption: editState.caption,
        altText: editState.altText,
        order: Number(editState.order) || 0,
        visible: editState.visible,
        downloadEnabled: editState.downloadEnabled,
      });
      cancelEdit();
    } catch {
      setError("Unable to update Gallery image.");
    }
  }

  async function toggleVisible(item: EventGalleryMedia) {
    setError("");
    try {
      await EventGalleryService.update(eventId, item.id, { visible: !item.visible });
    } catch {
      setError("Unable to update Gallery visibility.");
    }
  }

  async function toggleDownload(item: EventGalleryMedia) {
    setError("");
    try {
      await EventGalleryService.update(eventId, item.id, { downloadEnabled: !item.downloadEnabled });
    } catch {
      setError("Unable to update download permission.");
    }
  }

  async function deleteMedia(item: EventGalleryMedia) {
    if (!window.confirm(`Delete ${item.fileName} from this Event Gallery?`)) return;
    setError("");
    try {
      await EventGalleryService.delete(eventId, item);
      if (editingId === item.id) cancelEdit();
    } catch {
      setError("Unable to delete Gallery image. Storage or metadata may need manual review.");
    }
  }

  async function deleteAllMedia() {
    if (media.length === 0) return;
    const confirmed = window.confirm(`Delete all ${media.length} Gallery image${media.length === 1 ? "" : "s"} for this Event? This keeps the Event, livestream, and announcements.`);
    if (!confirmed) return;

    setError("");
    try {
      await EventGalleryService.deleteAll(eventId);
      cancelEdit();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete all Gallery media.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Optimized web photos</p>
            <p className="mt-1 text-xs leading-5 text-white/40">
              Upload JPEG, PNG, WebP, or AVIF images under {Math.round(EVENT_GALLERY_MAX_FILE_SIZE / (1024 * 1024))} MB each. Up to {EVENT_GALLERY_MAX_BATCH_SIZE} files per batch.
            </p>
          </div>
          <label className="btn-primary inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Select images
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading} onChange={uploadFiles} className="sr-only" />
          </label>
        </div>

        {uploadStatuses.length > 0 ? (
          <div className="grid gap-2">
            {uploadStatuses.map((item) => (
              <div key={item.id} className="grid gap-2 border border-white/10 bg-white/[0.025] p-3 text-xs text-white/55">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{item.fileName}</span>
                  <span className={item.state === "error" ? "text-red-200" : item.state === "complete" ? "text-[var(--accent-soft)]" : "text-white/45"}>{item.message}</span>
                </div>
                <div className="h-1.5 overflow-hidden bg-white/10">
                  <div className="h-full bg-[var(--accent-gold)] transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <p role="alert" className="border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm text-red-100">{error}</p> : null}
      {loading ? <p className="flex items-center gap-2 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin" />Loading Gallery media</p> : null}
      {!loading && media.length === 0 ? <p className="border border-dashed border-white/10 p-5 text-sm text-white/40">No Gallery images uploaded yet.</p> : null}

      {media.length > 0 ? (
        <div className="flex justify-end">
          <button type="button" onClick={deleteAllMedia} className="inline-flex min-h-11 items-center gap-2 border border-red-300/25 px-4 text-sm text-red-200 transition hover:bg-red-300/10">
            <Trash2 className="h-4 w-4" /> Delete all Gallery media
          </button>
        </div>
      ) : null}

      <div className="grid gap-4">
        {media.map((item) => (
          <article key={item.id} className="grid gap-4 border border-white/10 bg-white/[0.025] p-4 lg:grid-cols-[9rem_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden bg-black/30">
              {item.downloadUrl ? (
                // Firebase Storage URLs are runtime media; native img avoids broad remote image config changes.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.downloadUrl} alt={item.altText || item.caption || item.fileName} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-white/30"><ImageIcon className="h-6 w-6" /></div>
              )}
            </div>

            {editingId === item.id && editState ? (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                  <label className="grid gap-2 text-sm text-white/65">
                    <span>Caption</span>
                    <textarea value={editState.caption} onChange={(event) => setEditState((current) => current ? { ...current, caption: event.target.value } : current)} className={textareaClass} />
                  </label>
                  <label className="grid gap-2 text-sm text-white/65">
                    <span>Order</span>
                    <input type="number" value={editState.order} onChange={(event) => setEditState((current) => current ? { ...current, order: event.target.value } : current)} className={inputClass} />
                  </label>
                </div>
                <label className="grid gap-2 text-sm text-white/65">
                  <span>Alt text</span>
                  <input value={editState.altText} onChange={(event) => setEditState((current) => current ? { ...current, altText: event.target.value } : current)} className={inputClass} />
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="flex min-h-11 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70">
                      <input type="checkbox" checked={editState.visible} onChange={(event) => setEditState((current) => current ? { ...current, visible: event.target.checked } : current)} className="h-4 w-4 accent-[var(--accent-gold)]" />
                      Publicly visible
                    </label>
                    <label className="flex min-h-11 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70">
                      <input type="checkbox" checked={editState.downloadEnabled} onChange={(event) => setEditState((current) => current ? { ...current, downloadEnabled: event.target.checked } : current)} className="h-4 w-4 accent-[var(--accent-gold)]" />
                      Allow download
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={cancelEdit} className="inline-flex min-h-11 items-center gap-2 border border-white/10 px-4 text-sm text-white/60 transition hover:border-white/25 hover:text-white">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                    <button type="button" onClick={saveEdit} className="btn-primary inline-flex min-h-11 items-center gap-2 text-sm">
                      <Save className="h-4 w-4" /> Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{item.fileName}</p>
                    <span className={`border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${item.visible ? "border-[var(--accent-gold)]/35 text-[var(--accent-soft)]" : "border-white/10 text-white/40"}`}>
                      {item.visible ? "Visible" : "Hidden"}
                    </span>
                    <span className={`border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${item.downloadEnabled ? "border-white/25 text-white/65" : "border-white/10 text-white/35"}`}>
                      {item.downloadEnabled ? "Download on" : "Download off"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/40">{item.contentType} / {formatBytes(item.size)} / {item.width || "?"}x{item.height || "?"}</p>
                  {item.caption ? <p className="mt-3 text-sm leading-6 text-white/58">{item.caption}</p> : null}
                  {item.altText ? <p className="mt-2 text-xs leading-5 text-white/35">Alt: {item.altText}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => toggleVisible(item)} className="min-h-10 border border-white/10 px-3 text-xs uppercase tracking-[0.14em] text-white/60 transition hover:border-white/25 hover:text-white">
                    {item.visible ? "Hide" : "Show"}
                  </button>
                  <button type="button" onClick={() => toggleDownload(item)} className="inline-flex min-h-10 items-center gap-2 border border-white/10 px-3 text-xs uppercase tracking-[0.14em] text-white/60 transition hover:border-white/25 hover:text-white">
                    <Download className="h-3.5 w-3.5" /> {item.downloadEnabled ? "Disable" : "Enable"}
                  </button>
                  <button type="button" onClick={() => startEdit(item)} className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white/55 transition hover:border-white/25 hover:text-white" aria-label="Edit Gallery image" title="Edit Gallery image">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => deleteMedia(item)} className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-red-300/70 transition hover:border-red-300/30 hover:text-red-200" aria-label="Delete Gallery image" title="Delete Gallery image">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
