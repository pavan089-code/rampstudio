"use client";

import { Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import {
  addGalleryItem,
  getEvent,
  removeGalleryItem,
  uploadEventMedia,
} from "@/lib/events/events";
import type { EventRecord } from "@/types/event";

import EventAdminNav from "./EventAdminNav";

export default function EventGalleryManager({ id }: { id: string }) {
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState("General");

  const load = useCallback(() => getEvent(id).then(setEvent), [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function upload(files: FileList | null) {
    if (!files || !event) return;

    for (const file of Array.from(files)) {
      const media = await uploadEventMedia(id, file, setProgress);
      await addGalleryItem(event, {
        id: crypto.randomUUID(),
        ...media,
        category,
        caption: file.name.replace(/\.[^.]+$/, ""),
        isHero: false,
        downloadEnabled: event.settings.allowDownloads,
      });
      const refreshed = await getEvent(id);
      if (refreshed) setEvent(refreshed);
    }

    setProgress(0);
  }

  if (!event) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-6">
      <EventAdminNav id={id} />
      <div>
        <p className="text-xs uppercase tracking-[.2em] text-[var(--accent-gold)]">Gallery</p>
        <h1 className="mt-2 font-serif text-4xl">Media library</h1>
      </div>
      <div className="flex flex-col gap-3 border border-dashed border-white/20 p-6 sm:flex-row sm:items-center">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="field-surface px-4 py-3"
        />
        <label className="flex cursor-pointer items-center gap-2 bg-[var(--accent-gold)] px-5 py-3 text-sm text-black">
          <Upload className="h-4 w-4" />
          Upload images or videos
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => void upload(e.target.files)}
          />
        </label>
        {progress > 0 && <span className="text-sm text-white/55">Uploading {progress}%</span>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {event.gallery.map((item) => (
          <article key={item.id} className="border border-white/10 bg-white/[.025] p-3">
            <div className="relative aspect-video bg-black">
              {item.type === "image" ? (
                <Image src={item.url} alt={item.caption} fill sizes="33vw" className="object-cover" />
              ) : (
                <video src={item.url} controls className="h-full w-full object-cover" />
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm">{item.caption}</p>
                <p className="text-xs text-white/40">{item.category}</p>
              </div>
              <button
                onClick={async () => {
                  await removeGalleryItem(event, item);
                  await load();
                }}
                className="p-2 text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
