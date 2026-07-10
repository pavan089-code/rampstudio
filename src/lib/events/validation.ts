import type { EventInput, EventValidationErrors } from "@/types/event";
import { normalizeYouTubeUrl } from "./youtube";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function generateEventSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidMediaLocation(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidDateValue(value: string): boolean {
  if (!value) return true;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function isValidTimeValue(value: string): boolean {
  return !value || TIME_PATTERN.test(value);
}

export function validateEvent(input: EventInput): EventValidationErrors {
  const errors: EventValidationErrors = {};

  if (!input.title.trim()) errors.title = "Title is required.";
  if (!input.slug.trim()) errors.slug = "Slug is required.";
  else if (!SLUG_PATTERN.test(input.slug)) errors.slug = "Use lowercase letters, numbers, and hyphens only.";
  if (!input.eventType.trim()) errors.eventType = "Event type is required.";
  if (!input.theme.trim()) errors.theme = "Theme is required.";
  if (input.eventDate && !isValidDateValue(input.eventDate)) errors.eventDate = "Enter a valid event date.";
  if (input.eventTime && !isValidTimeValue(input.eventTime)) errors.eventTime = "Enter a valid start time.";
  if (input.eventEndDate && !isValidDateValue(input.eventEndDate)) errors.eventEndDate = "Enter a valid end date.";
  if (input.eventEndTime && !isValidTimeValue(input.eventEndTime)) errors.eventEndTime = "Enter a valid end time.";
  if (!input.timezone.trim()) errors.timezone = "Timezone is required.";
  if (input.published && input.status !== "published") {
    errors.published = "Only events with Published status can be publicly visible.";
  }
  if (input.mapLink && !isValidMediaLocation(input.mapLink)) errors.mapLink = "Enter a valid URL.";
  if (input.heroImage && !isValidMediaLocation(input.heroImage)) errors.heroImage = "Enter a valid URL or a /public path.";
  if (input.coverVideo && !isValidMediaLocation(input.coverVideo)) errors.coverVideo = "Enter a valid URL or a /public path.";
  if (input.venueDetails.mapLink && !isValidMediaLocation(input.venueDetails.mapLink)) errors["venueDetails.mapLink"] = "Enter a valid URL.";
  if (input.media.galleryCoverImage && !isValidMediaLocation(input.media.galleryCoverImage)) errors["media.galleryCoverImage"] = "Enter a valid URL or a /public path.";
  if (input.media.livestreamUrl && !normalizeYouTubeUrl(input.media.livestreamUrl)) errors["media.livestreamUrl"] = "Enter a supported YouTube URL.";
  if (input.media.livestreamStartDateTime && Number.isNaN(new Date(input.media.livestreamStartDateTime).getTime())) {
    errors["media.livestreamStartDateTime"] = "Enter a valid scheduled start.";
  }
  if (input.media.livestreamEndDateTime && Number.isNaN(new Date(input.media.livestreamEndDateTime).getTime())) {
    errors["media.livestreamEndDateTime"] = "Enter a valid scheduled end.";
  }
  if (input.media.highlightVideoUrl && !isValidMediaLocation(input.media.highlightVideoUrl)) errors["media.highlightVideoUrl"] = "Enter a valid URL or a /public path.";
  if (input.ogImage && !isValidMediaLocation(input.ogImage)) errors.ogImage = "Enter a valid URL or a /public path.";
  if (input.metaTitle.length > 70) errors.metaTitle = "Keep the meta title at 70 characters or fewer.";
  if (input.metaDescription.length > 160) errors.metaDescription = "Keep the meta description at 160 characters or fewer.";
  input.hosts.forEach((host, index) => {
    if (!host.name.trim() && (host.role.trim() || host.description.trim() || host.image.trim())) {
      errors[`hosts.${index}.name`] = "Add a name or remove this host.";
    }
    if (host.image && !isValidMediaLocation(host.image)) {
      errors[`hosts.${index}.image`] = "Enter a valid URL or a /public path.";
    }
  });
  input.schedule.forEach((item, index) => {
    if (!item.title.trim() && (item.date || item.startTime || item.location || item.description)) {
      errors[`schedule.${index}.title`] = "Add a title or remove this schedule item.";
    }
    if (item.date && !isValidDateValue(item.date)) errors[`schedule.${index}.date`] = "Enter a valid date.";
    if (item.startTime && !isValidTimeValue(item.startTime)) errors[`schedule.${index}.startTime`] = "Enter a valid start time.";
    if (item.endTime && !isValidTimeValue(item.endTime)) errors[`schedule.${index}.endTime`] = "Enter a valid end time.";
  });

  return errors;
}

export function hasEventValidationErrors(errors: EventValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
