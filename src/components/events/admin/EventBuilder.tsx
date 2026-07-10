"use client";

import { ArrowLeft, ChevronDown, ChevronUp, Eye, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import EventAnnouncementsManager from "@/components/events/admin/EventAnnouncementsManager";
import EventAnalyticsSummary from "@/components/events/admin/EventAnalyticsSummary";
import EventGalleryManager from "@/components/events/admin/EventGalleryManager";
import { useAdminClientAuth } from "@/hooks/useAuth";
import {
  createEmptyEvent,
  EVENT_GALLERY_STATUS_OPTIONS,
  EVENT_LIFECYCLE_MODES,
  EVENT_LIVESTREAM_PROVIDER_OPTIONS,
  EVENT_LIVESTREAM_STATUS_OPTIONS,
  EVENT_SECTION_OPTIONS,
  EVENT_STATUS_OPTIONS,
  EVENT_THEMES,
  EVENT_TIMEZONES,
  EVENT_TYPES,
  EventService,
  generateEventSlug,
  hasEventValidationErrors,
  validateEvent,
} from "@/lib/events";
import type {
  EventHost,
  EventInput,
  EventScheduleItem,
  EventSectionKey,
  EventValidationErrors,
} from "@/types/event";

const inputClass = "field-surface w-full px-4 py-3";
const textareaClass = `${inputClass} min-h-28 resize-y`;

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

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white/55 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function newHost(order: number): EventHost {
  return { id: createId("host"), name: "", role: "", description: "", image: "", order };
}

function newScheduleItem(order: number): EventScheduleItem {
  return {
    id: createId("schedule"),
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    order,
  };
}

function reorder<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

function joinDateTime(date: string, time: string): string {
  return date ? [date, time].filter(Boolean).join("T") : "";
}

export default function EventBuilder({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventInput>(createEmptyEvent());
  const [errors, setErrors] = useState<EventValidationErrors>({});
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [slugEdited, setSlugEdited] = useState(Boolean(eventId));
  const { status } = useAdminClientAuth();

  useEffect(() => {
    if (!eventId) return;
    if (status === "checking") return;

    if (status !== "authenticated") {
      const timeout = window.setTimeout(() => {
        setSaveError("Please sign in to load this event.");
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timeout);
    }

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
  }, [eventId, status]);

  function update<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setEvent((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateEventTiming(key: "eventDate" | "eventTime" | "eventEndDate" | "eventEndTime", value: string) {
    setEvent((current) => {
      const next = { ...current, [key]: value };
      return {
        ...next,
        lifecycle: {
          ...next.lifecycle,
          startDateTime: joinDateTime(next.eventDate, next.eventTime),
          endDateTime: joinDateTime(next.eventEndDate, next.eventEndTime),
          timezone: next.timezone,
        },
      };
    });
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

  function updatePresentation(key: keyof EventInput["presentation"], value: string) {
    setEvent((current) => ({
      ...current,
      presentation: { ...current.presentation, [key]: value },
    }));
  }

  function updateVenueDetails(key: keyof EventInput["venueDetails"], value: string) {
    setEvent((current) => ({
      ...current,
      venueDetails: { ...current.venueDetails, [key]: value },
    }));
    setErrors((current) => ({ ...current, [`venueDetails.${key}`]: undefined }));
  }

  function updateLifecycle(key: keyof EventInput["lifecycle"], value: EventInput["lifecycle"][keyof EventInput["lifecycle"]]) {
    setEvent((current) => ({
      ...current,
      lifecycle: { ...current.lifecycle, [key]: value },
      timezone: key === "timezone" && typeof value === "string" ? value : current.timezone,
    }));
  }

  function updateMedia(key: keyof EventInput["media"], value: EventInput["media"][keyof EventInput["media"]]) {
    setEvent((current) => ({
      ...current,
      media: { ...current.media, [key]: value },
    }));
    setErrors((current) => ({ ...current, [`media.${key}`]: undefined }));
  }

  function updateSection(key: EventSectionKey, value: boolean) {
    setEvent((current) => ({
      ...current,
      sections: { ...current.sections, [key]: value },
    }));
  }

  function updateHost(index: number, key: keyof EventHost, value: string) {
    setEvent((current) => ({
      ...current,
      hosts: current.hosts.map((host, hostIndex) => hostIndex === index ? { ...host, [key]: value } : host),
    }));
    setErrors((current) => ({ ...current, [`hosts.${index}.${key}`]: undefined }));
  }

  function updateSchedule(index: number, key: keyof EventScheduleItem, value: string) {
    setEvent((current) => ({
      ...current,
      schedule: current.schedule.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }));
    setErrors((current) => ({ ...current, [`schedule.${index}.${key}`]: undefined }));
  }

  function moveItem<T extends { order: number }>(items: T[], index: number, direction: -1 | 1): T[] {
    const next = [...items];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= next.length) return items;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    return reorder(next);
  }

  async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (status !== "authenticated") {
      setSaveError("Please sign in before saving this event.");
      return;
    }

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
          <p className="mt-7 text-xs uppercase tracking-[0.22em] text-[var(--accent-gold)]">Event experience platform</p>
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

      <FormSection title="General" description="Core event identity, URL, timing, lifecycle, and publishing state.">
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
          <Field label="Theme" error={errors.theme}>
            <select value={event.theme} onChange={(e) => update("theme", e.target.value)} className={inputClass}>
              {EVENT_THEMES.map((theme) => <option key={theme.value} value={theme.value}>{theme.label}</option>)}
            </select>
          </Field>
          <Field label="Event date" error={errors.eventDate}>
            <input type="date" value={event.eventDate} onChange={(e) => updateEventTiming("eventDate", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Start time" error={errors.eventTime}>
            <input type="time" value={event.eventTime} onChange={(e) => updateEventTiming("eventTime", e.target.value)} className={inputClass} />
          </Field>
          <Field label="End date" error={errors.eventEndDate}>
            <input type="date" value={event.eventEndDate} onChange={(e) => updateEventTiming("eventEndDate", e.target.value)} className={inputClass} />
          </Field>
          <Field label="End time" error={errors.eventEndTime}>
            <input type="time" value={event.eventEndTime} onChange={(e) => updateEventTiming("eventEndTime", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Timezone" error={errors.timezone}>
            <select value={event.timezone} onChange={(e) => { update("timezone", e.target.value); updateLifecycle("timezone", e.target.value); }} className={inputClass}>
              {EVENT_TIMEZONES.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
            </select>
          </Field>
          <Field
            label="Lifecycle mode"
            hint={event.lifecycle.mode === "auto"
              ? "Automatic: Ramp Studio determines the Event phase from configured start/end dates."
              : "Manual: Admin explicitly controls the public Event phase."}
          >
            <select value={event.lifecycle.mode} onChange={(e) => updateLifecycle("mode", e.target.value as EventInput["lifecycle"]["mode"])} className={inputClass}>
              {EVENT_LIFECYCLE_MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Presentation" description="Editorial copy for future cinematic event sections. The current public page safely falls back to the event title.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Eyebrow">
            <input value={event.presentation.eyebrow} onChange={(e) => updatePresentation("eyebrow", e.target.value)} className={inputClass} placeholder="A private celebration" />
          </Field>
          <Field label="Primary CTA label">
            <input value={event.presentation.primaryCtaLabel} onChange={(e) => updatePresentation("primaryCtaLabel", e.target.value)} className={inputClass} placeholder="View details" />
          </Field>
        </div>
        <Field label="Headline">
          <input value={event.presentation.headline} onChange={(e) => updatePresentation("headline", e.target.value)} className={inputClass} placeholder="A cinematic celebration of love" />
        </Field>
        <Field label="Subtitle">
          <textarea value={event.presentation.subtitle} onChange={(e) => updatePresentation("subtitle", e.target.value)} className={textareaClass} />
        </Field>
        <Field label="Invitation / event message">
          <textarea value={event.presentation.message} onChange={(e) => updatePresentation("message", e.target.value)} className={textareaClass} />
        </Field>
        <Field label="Story">
          <textarea value={event.presentation.story} onChange={(e) => updatePresentation("story", e.target.value)} className={`${textareaClass} min-h-36`} />
        </Field>
      </FormSection>

      <FormSection title="Hosts / People" description="Flexible people or family groups for weddings, birthdays, temple events, anniversaries, corporate events, and other experiences.">
        <div className="flex justify-end">
          <button type="button" onClick={() => setEvent((current) => ({ ...current, hosts: [...current.hosts, newHost(current.hosts.length)] }))} className="inline-flex min-h-11 items-center gap-2 border border-white/10 px-4 text-sm text-white/70 transition hover:border-white/25 hover:text-white">
            <Plus className="h-4 w-4" /> Add host
          </button>
        </div>
        {event.hosts.length === 0 ? <p className="border border-dashed border-white/10 p-5 text-sm text-white/40">No hosts or people added yet.</p> : null}
        {event.hosts.map((host, index) => (
          <div key={host.id} className="grid gap-4 border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Host {index + 1}</p>
              <div className="flex gap-2">
                <IconButton label="Move host up" onClick={() => setEvent((current) => ({ ...current, hosts: moveItem(current.hosts, index, -1) }))} disabled={index === 0}><ChevronUp className="h-4 w-4" /></IconButton>
                <IconButton label="Move host down" onClick={() => setEvent((current) => ({ ...current, hosts: moveItem(current.hosts, index, 1) }))} disabled={index === event.hosts.length - 1}><ChevronDown className="h-4 w-4" /></IconButton>
                <IconButton label="Remove host" onClick={() => setEvent((current) => ({ ...current, hosts: reorder(current.hosts.filter((_, hostIndex) => hostIndex !== index)) }))}><Trash2 className="h-4 w-4" /></IconButton>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={errors[`hosts.${index}.name`]}>
                <input value={host.name} onChange={(e) => updateHost(index, "name", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Role / group">
                <input value={host.role} onChange={(e) => updateHost(index, "role", e.target.value)} className={inputClass} placeholder="Family, Host, Couple, Team" />
              </Field>
              <Field label="Image" error={errors[`hosts.${index}.image`]}>
                <input value={host.image} onChange={(e) => updateHost(index, "image", e.target.value)} className={inputClass} placeholder="https://... or /images/person.jpg" />
              </Field>
            </div>
            <Field label="Description">
              <textarea value={host.description} onChange={(e) => updateHost(index, "description", e.target.value)} className={textareaClass} />
            </Field>
          </div>
        ))}
      </FormSection>

      <FormSection title="Schedule" description="Simple ordered event timeline entries for public display in a future microsite phase.">
        <div className="flex justify-end">
          <button type="button" onClick={() => setEvent((current) => ({ ...current, schedule: [...current.schedule, newScheduleItem(current.schedule.length)] }))} className="inline-flex min-h-11 items-center gap-2 border border-white/10 px-4 text-sm text-white/70 transition hover:border-white/25 hover:text-white">
            <Plus className="h-4 w-4" /> Add schedule item
          </button>
        </div>
        {event.schedule.length === 0 ? <p className="border border-dashed border-white/10 p-5 text-sm text-white/40">No schedule items added yet.</p> : null}
        {event.schedule.map((item, index) => (
          <div key={item.id} className="grid gap-4 border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Schedule {index + 1}</p>
              <div className="flex gap-2">
                <IconButton label="Move schedule item up" onClick={() => setEvent((current) => ({ ...current, schedule: moveItem(current.schedule, index, -1) }))} disabled={index === 0}><ChevronUp className="h-4 w-4" /></IconButton>
                <IconButton label="Move schedule item down" onClick={() => setEvent((current) => ({ ...current, schedule: moveItem(current.schedule, index, 1) }))} disabled={index === event.schedule.length - 1}><ChevronDown className="h-4 w-4" /></IconButton>
                <IconButton label="Remove schedule item" onClick={() => setEvent((current) => ({ ...current, schedule: reorder(current.schedule.filter((_, itemIndex) => itemIndex !== index)) }))}><Trash2 className="h-4 w-4" /></IconButton>
              </div>
            </div>
            <Field label="Title" error={errors[`schedule.${index}.title`]}>
              <input value={item.title} onChange={(e) => updateSchedule(index, "title", e.target.value)} className={inputClass} placeholder="Haldi ceremony" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Date" error={errors[`schedule.${index}.date`]}>
                <input type="date" value={item.date} onChange={(e) => updateSchedule(index, "date", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Start" error={errors[`schedule.${index}.startTime`]}>
                <input type="time" value={item.startTime} onChange={(e) => updateSchedule(index, "startTime", e.target.value)} className={inputClass} />
              </Field>
              <Field label="End" error={errors[`schedule.${index}.endTime`]}>
                <input type="time" value={item.endTime} onChange={(e) => updateSchedule(index, "endTime", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Location">
                <input value={item.location} onChange={(e) => updateSchedule(index, "location", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Description">
              <textarea value={item.description} onChange={(e) => updateSchedule(index, "description", e.target.value)} className={textareaClass} />
            </Field>
          </div>
        ))}
      </FormSection>

      <FormSection title="Venue" description="Preserves the current venue and map link while preparing richer venue presentation.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Venue" error={errors.venue}>
            <input value={event.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} placeholder="The Leela Palace, Bengaluru" />
          </Field>
          <Field label="Map link" error={errors.mapLink}>
            <input type="url" value={event.mapLink} onChange={(e) => update("mapLink", e.target.value)} className={inputClass} placeholder="https://maps.google.com/..." />
          </Field>
          <Field label="Display venue name">
            <input value={event.venueDetails.name} onChange={(e) => updateVenueDetails("name", e.target.value)} className={inputClass} />
          </Field>
          <Field label="City">
            <input value={event.venueDetails.city} onChange={(e) => updateVenueDetails("city", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Venue detail map link" error={errors["venueDetails.mapLink"]}>
            <input type="url" value={event.venueDetails.mapLink} onChange={(e) => updateVenueDetails("mapLink", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Address">
          <textarea value={event.venueDetails.address} onChange={(e) => updateVenueDetails("address", e.target.value)} className={textareaClass} />
        </Field>
        <Field label="Venue note">
          <textarea value={event.venueDetails.note} onChange={(e) => updateVenueDetails("note", e.target.value)} className={textareaClass} />
        </Field>
      </FormSection>

      <FormSection title="Public Sections" description="Controls for upcoming public microsite sections. RSVP and guest features are intentionally excluded.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_SECTION_OPTIONS.map((section) => (
            <label key={section.key} className="flex min-h-12 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70">
              <input
                type="checkbox"
                checked={event.sections[section.key as EventSectionKey]}
                onChange={(e) => updateSection(section.key as EventSectionKey, e.target.checked)}
                className="h-4 w-4 accent-[var(--accent-gold)]"
              />
              {section.label}
            </label>
          ))}
        </div>
      </FormSection>

      <FormSection title="Media Configuration" description="Hero media, gallery foundations, and YouTube livestream configuration for event-day viewing.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Hero image" error={errors.heroImage}>
            <input value={event.heroImage} onChange={(e) => update("heroImage", e.target.value)} className={inputClass} placeholder="https://... or /images/event-hero.jpg" />
          </Field>
          <Field label="Cover video" error={errors.coverVideo}>
            <input value={event.coverVideo} onChange={(e) => update("coverVideo", e.target.value)} className={inputClass} placeholder="https://... or /videos/event-film.mp4" />
          </Field>
          <Field label="Gallery status">
            <select value={event.media.galleryStatus} onChange={(e) => updateMedia("galleryStatus", e.target.value as EventInput["media"]["galleryStatus"])} className={inputClass}>
              {EVENT_GALLERY_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
          <Field label="Gallery cover image" error={errors["media.galleryCoverImage"]}>
            <input value={event.media.galleryCoverImage} onChange={(e) => updateMedia("galleryCoverImage", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Highlight video URL" error={errors["media.highlightVideoUrl"]}>
            <input value={event.media.highlightVideoUrl} onChange={(e) => updateMedia("highlightVideoUrl", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex min-h-12 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70">
            <input type="checkbox" checked={event.media.galleryEnabled} onChange={(e) => updateMedia("galleryEnabled", e.target.checked)} className="h-4 w-4 accent-[var(--accent-gold)]" />
            Gallery foundation
          </label>
          <label className="flex min-h-12 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70">
            <input
              type="checkbox"
              checked={event.media.livestreamEnabled && event.sections.livestream}
              onChange={(e) => {
                updateMedia("livestreamEnabled", e.target.checked);
                updateSection("livestream", e.target.checked);
              }}
              className="h-4 w-4 accent-[var(--accent-gold)]"
            />
            Enable livestream
          </label>
          <label className="flex min-h-12 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70">
            <input type="checkbox" checked={event.media.highlightsEnabled} onChange={(e) => updateMedia("highlightsEnabled", e.target.checked)} className="h-4 w-4 accent-[var(--accent-gold)]" />
            Highlights foundation
          </label>
        </div>
        <div className="grid gap-5 border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
          <Field label="Livestream provider">
            <select value={event.media.livestreamProvider} onChange={(e) => updateMedia("livestreamProvider", e.target.value as EventInput["media"]["livestreamProvider"])} className={inputClass}>
              {EVENT_LIVESTREAM_PROVIDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
          <Field label="Livestream state">
            <select value={event.media.livestreamStatus} onChange={(e) => updateMedia("livestreamStatus", e.target.value as EventInput["media"]["livestreamStatus"])} className={inputClass}>
              {EVENT_LIVESTREAM_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
          <Field label="YouTube URL" error={errors["media.livestreamUrl"]} hint="Supported: youtube.com/watch, youtu.be, youtube.com/live, and youtube.com/embed URLs.">
            <input type="url" value={event.media.livestreamUrl} onChange={(e) => updateMedia("livestreamUrl", e.target.value)} className={inputClass} placeholder="https://youtube.com/watch?v=..." />
          </Field>
          <Field label="Button / short label">
            <input value={event.media.livestreamLabel} onChange={(e) => updateMedia("livestreamLabel", e.target.value)} className={inputClass} placeholder="Watch live" />
          </Field>
          <Field label="Livestream title">
            <input value={event.media.livestreamTitle} onChange={(e) => updateMedia("livestreamTitle", e.target.value)} className={inputClass} placeholder="Ceremony livestream" />
          </Field>
          <Field label="Scheduled start" error={errors["media.livestreamStartDateTime"]}>
            <input type="datetime-local" value={event.media.livestreamStartDateTime} onChange={(e) => updateMedia("livestreamStartDateTime", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Scheduled end" error={errors["media.livestreamEndDateTime"]}>
            <input type="datetime-local" value={event.media.livestreamEndDateTime} onChange={(e) => updateMedia("livestreamEndDateTime", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Ended / fallback message">
            <input value={event.media.livestreamFallbackMessage} onChange={(e) => updateMedia("livestreamFallbackMessage", e.target.value)} className={inputClass} placeholder="This livestream has ended." />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea value={event.media.livestreamDescription} onChange={(e) => updateMedia("livestreamDescription", e.target.value)} className={textareaClass} placeholder="A short note shown beside the livestream." />
            </Field>
          </div>
          <label className="flex min-h-12 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70 sm:col-span-2">
            <input type="checkbox" checked={event.media.livestreamReplayEnabled} onChange={(e) => updateMedia("livestreamReplayEnabled", e.target.checked)} className="h-4 w-4 accent-[var(--accent-gold)]" />
            Keep replay embed visible after the configured end
          </label>
        </div>
      </FormSection>

      {eventId ? (
        <FormSection title="Event Analytics" description="Aggregate public microsite activity from the controlled server analytics endpoint.">
          <EventAnalyticsSummary eventId={eventId} />
        </FormSection>
      ) : null}

      {eventId ? (
        <FormSection title="Gallery Media" description="Upload optimized web photos for this Event Gallery. Original archives, RAW storage, and bulk downloads are intentionally excluded.">
          <EventGalleryManager eventId={eventId} />
        </FormSection>
      ) : null}

      {eventId ? (
        <FormSection title="Announcements" description="Plain text event-day updates displayed publicly only after publication.">
          <EventAnnouncementsManager eventId={eventId} />
        </FormSection>
      ) : null}

      <FormSection title="SEO" description="Search and social sharing metadata. Empty fields fall back to the event title and hero image.">
        <Field label="Meta title" error={errors.metaTitle} hint={`${event.metaTitle.length}/70 characters`}>
          <input value={event.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} maxLength={70} className={inputClass} />
        </Field>
        <Field label="Meta description" error={errors.metaDescription} hint={`${event.metaDescription.length}/160 characters`}>
          <textarea value={event.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} maxLength={160} className={textareaClass} />
        </Field>
        <Field label="Open Graph image" error={errors.ogImage}>
          <input value={event.ogImage} onChange={(e) => update("ogImage", e.target.value)} className={inputClass} placeholder="https://... or /images/event-social.jpg" />
        </Field>
      </FormSection>

      <FormSection title="Publishing" description="Publishing remains explicit. Archived or draft events are not publicly visible.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Status">
            <select value={event.status} onChange={(e) => { const status = e.target.value as EventInput["status"]; setEvent((current) => ({ ...current, status, published: status === "published" ? current.published : false })); }} className={inputClass}>
              {EVENT_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
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
    </form>
  );
}
