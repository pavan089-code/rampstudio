"use client";

import { ArrowLeft, Eye, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import {
  createEmptyEvent,
  EVENT_STATUS_OPTIONS,
  EVENT_THEMES,
  EVENT_TYPES,
  EventService,
  generateEventSlug,
  hasEventValidationErrors,
  validateEvent,
} from "@/lib/events";
import type { EventInput, EventValidationErrors } from "@/types/event";

const inputClass = "field-surface w-full px-4 py-3";

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="border border-white/10 bg-white/[0.025] p-5 sm:p-7">
      <div className="max-w-2xl">
        <h2 className="font-serif text-2xl text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/45">{description}</p>
      </div>
      <div className="mt-7 grid gap-5">{children}</div>
    </section>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-white/65">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-red-300">{error}</span> : hint ? <span className="text-xs text-white/35">{hint}</span> : null}
    </label>
  );
}

export default function EventBuilder({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventInput>(createEmptyEvent());
  const [errors, setErrors] = useState<EventValidationErrors>({});
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [slugEdited, setSlugEdited] = useState(Boolean(eventId));

  useEffect(() => {
    if (!eventId) return;

    EventService.getById(eventId)
      .then((record) => {
        if (!record) {
          setSaveError("Event not found.");
          return;
        }
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = record;
        setEvent(input);
      })
      .catch(() => setSaveError("Unable to load this event."))
      .finally(() => setLoading(false));
  }, [eventId]);

  function update<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setEvent((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateTitle(title: string) {
    setEvent((current) => ({
      ...current,
      title,
      slug: slugEdited ? current.slug : generateEventSlug(title),
    }));
    setErrors((current) => ({ ...current, title: undefined, slug: undefined }));
  }

  async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    const nextErrors = validateEvent(event);
    setErrors(nextErrors);
    setSaveError("");
    if (hasEventValidationErrors(nextErrors)) return;

    setSaving(true);
    try {
      if (eventId) {
        await EventService.update(eventId, event);
      } else {
        await EventService.create(event);
      }
      router.push("/admin/events");
      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save this event.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin" />Loading event</div>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Events
          </Link>
          <p className="mt-7 text-xs uppercase tracking-[0.22em] text-[var(--accent-gold)]">Event microsite</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{eventId ? "Edit event" : "Create event"}</h1>
        </div>
        <div className="flex gap-2">
          {eventId && event.slug && event.published ? (
            <a href={`/events/${event.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/10 px-4 py-3 text-sm transition hover:border-white/25">
              <Eye className="h-4 w-4" /> View
            </a>
          ) : null}
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving" : "Save event"}
          </button>
        </div>
      </div>

      {saveError ? <p role="alert" className="border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm text-red-100">{saveError}</p> : null}

      <FormSection title="General" description="Core event details and publishing controls for the microsite.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" error={errors.title}>
            <input value={event.title} onChange={(e) => updateTitle(e.target.value)} required className={inputClass} placeholder="Rahul & Priya Wedding" />
          </Field>
          <Field label="Slug" error={errors.slug} hint="Generated from the title. You can refine it before publishing.">
            <div className="flex min-w-0">
              <span className="flex items-center border border-r-0 border-white/10 px-3 text-xs text-white/35">/events/</span>
              <input value={event.slug} onChange={(e) => { setSlugEdited(true); update("slug", generateEventSlug(e.target.value)); }} required className={`${inputClass} min-w-0`} placeholder="rahul-priya-wedding" />
            </div>
          </Field>
          <Field label="Event type" error={errors.eventType}>
            <select value={event.eventType} onChange={(e) => update("eventType", e.target.value)} className={inputClass}>
              {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={event.status} onChange={(e) => { const status = e.target.value as EventInput["status"]; setEvent((current) => ({ ...current, status, published: status === "published" ? current.published : false })); }} className={inputClass}>
              {EVENT_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </Field>
          <Field label="Event date">
            <input type="date" value={event.eventDate} onChange={(e) => update("eventDate", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Event time">
            <input type="time" value={event.eventTime} onChange={(e) => update("eventTime", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Venue">
            <input value={event.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} placeholder="The Leela Palace, Bengaluru" />
          </Field>
          <Field label="Map link" error={errors.mapLink}>
            <input type="url" value={event.mapLink} onChange={(e) => update("mapLink", e.target.value)} className={inputClass} placeholder="https://maps.google.com/..." />
          </Field>
          <Field label="Theme" error={errors.theme}>
            <select value={event.theme} onChange={(e) => update("theme", e.target.value)} className={inputClass}>
              {EVENT_THEMES.map((theme) => <option key={theme.value} value={theme.value}>{theme.label}</option>)}
            </select>
          </Field>
          <Field label="Public visibility" error={errors.published}>
            <label className="flex min-h-[52px] items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-white/75">
              <input type="checkbox" checked={event.published} onChange={(e) => setEvent((current) => ({ ...current, published: e.target.checked, status: e.target.checked ? "published" : current.status }))} className="h-4 w-4 accent-[var(--accent-gold)]" />
              Published at /events/{event.slug || "your-event"}
            </label>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Media" description="The hero image is shown now. Cover video is stored for a future microsite release.">
        <Field label="Hero image" error={errors.heroImage}>
          <input value={event.heroImage} onChange={(e) => update("heroImage", e.target.value)} className={inputClass} placeholder="https://... or /images/event-hero.jpg" />
        </Field>
        <Field label="Cover video" error={errors.coverVideo}>
          <input value={event.coverVideo} onChange={(e) => update("coverVideo", e.target.value)} className={inputClass} placeholder="https://... or /videos/event-film.mp4" />
        </Field>
      </FormSection>

      <FormSection title="SEO" description="Search and social sharing metadata. Empty fields fall back to the event title and hero image.">
        <Field label="Meta title" error={errors.metaTitle} hint={`${event.metaTitle.length}/70 characters`}>
          <input value={event.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} maxLength={70} className={inputClass} />
        </Field>
        <Field label="Meta description" error={errors.metaDescription} hint={`${event.metaDescription.length}/160 characters`}>
          <textarea value={event.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} maxLength={160} className={`${inputClass} min-h-28 resize-y`} />
        </Field>
        <Field label="Open Graph image" error={errors.ogImage}>
          <input value={event.ogImage} onChange={(e) => update("ogImage", e.target.value)} className={inputClass} placeholder="https://... or /images/event-social.jpg" />
        </Field>
      </FormSection>
    </form>
  );
}
