"use client";

import { Edit2, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useAdminClientAuth } from "@/hooks/useAuth";
import { EVENT_ANNOUNCEMENT_PRIORITY_OPTIONS, EventAnnouncementService } from "@/lib/events";
import type { EventAnnouncement, EventAnnouncementInput } from "@/types/event";

const emptyInput: EventAnnouncementInput = {
  title: "",
  message: "",
  priority: "normal",
  published: false,
};

const inputClass = "field-surface w-full px-4 py-3";
const textareaClass = `${inputClass} min-h-28 resize-y`;

export default function EventAnnouncementsManager({ eventId }: { eventId: string }) {
  const [announcements, setAnnouncements] = useState<EventAnnouncement[]>([]);
  const [form, setForm] = useState<EventAnnouncementInput>(emptyInput);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { status } = useAdminClientAuth();

  useEffect(() => {
    if (status === "checking") return;

    if (status !== "authenticated") {
      const timeout = window.setTimeout(() => {
        setError("Please sign in to manage announcements.");
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    return EventAnnouncementService.subscribe(eventId, (items) => {
      setAnnouncements(items);
      setError("");
      setLoading(false);
    }, () => {
      setError("Unable to load announcements.");
      setLoading(false);
    });
  }, [eventId, status]);

  function resetForm() {
    setForm(emptyInput);
    setEditingId("");
  }

  function editAnnouncement(announcement: EventAnnouncement) {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      published: announcement.published,
    });
  }

  async function submit() {
    if (status !== "authenticated") {
      setError("Please sign in before saving announcements.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await EventAnnouncementService.update(eventId, editingId, form);
      } else {
        await EventAnnouncementService.create(eventId, form);
      }
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save announcement.");
    } finally {
      setSaving(false);
    }
  }

  async function removeAnnouncement(announcementId: string) {
    if (!window.confirm("Delete this announcement?")) return;
    setError("");
    try {
      await EventAnnouncementService.delete(eventId, announcementId);
      if (editingId === announcementId) resetForm();
    } catch {
      setError("Unable to delete announcement.");
    }
  }

  async function togglePublished(announcement: EventAnnouncement) {
    setError("");
    try {
      await EventAnnouncementService.update(eventId, announcement.id, {
        title: announcement.title,
        message: announcement.message,
        priority: announcement.priority,
        published: !announcement.published,
      });
    } catch {
      setError("Unable to update announcement visibility.");
    }
  }

  return (
    <div className="grid gap-6">
      {error ? <p role="alert" className="border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm text-red-100">{error}</p> : null}

      <div className="grid gap-4 border border-white/10 bg-black/20 p-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <label className="grid gap-2 text-sm text-white/65">
            <span>Title</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} placeholder="Ceremony update" />
          </label>
          <label className="grid gap-2 text-sm text-white/65">
            <span>Priority</span>
            <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as EventAnnouncementInput["priority"] }))} className={inputClass}>
              {EVENT_ANNOUNCEMENT_PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm text-white/65">
          <span>Message</span>
          <textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} className={textareaClass} placeholder="Share a clear event-day update for guests." />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-h-11 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70">
            <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} className="h-4 w-4 accent-[var(--accent-gold)]" />
            Publish announcement
          </label>
          <div className="flex gap-2">
            {editingId ? (
              <button type="button" onClick={resetForm} className="inline-flex min-h-11 items-center gap-2 border border-white/10 px-4 text-sm text-white/60 transition hover:border-white/25 hover:text-white">
                <X className="h-4 w-4" />Cancel
              </button>
            ) : null}
            <button type="button" onClick={submit} disabled={saving} className="btn-primary inline-flex min-h-11 items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Save update" : "Add announcement"}
            </button>
          </div>
        </div>
      </div>

      {loading ? <p className="flex items-center gap-2 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin" />Loading announcements</p> : null}
      {!loading && announcements.length === 0 ? <p className="border border-dashed border-white/10 p-5 text-sm text-white/40">No announcements yet.</p> : null}
      <div className="grid gap-3">
        {announcements.map((announcement) => (
          <article key={announcement.id} className="grid gap-4 border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-white">{announcement.title}</p>
                <span className="border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">{announcement.priority}</span>
                <span className={`border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${announcement.published ? "border-[var(--accent-gold)]/35 text-[var(--accent-soft)]" : "border-white/10 text-white/40"}`}>
                  {announcement.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/52">{announcement.message}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button type="button" onClick={() => togglePublished(announcement)} className="min-h-10 border border-white/10 px-3 text-xs uppercase tracking-[0.14em] text-white/60 transition hover:border-white/25 hover:text-white">
                {announcement.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" onClick={() => editAnnouncement(announcement)} className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white/55 transition hover:border-white/25 hover:text-white" aria-label="Edit announcement" title="Edit announcement">
                <Edit2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => removeAnnouncement(announcement.id)} className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-red-300/70 transition hover:border-red-300/30 hover:text-red-200" aria-label="Delete announcement" title="Delete announcement">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
