import type { EventInput, EventValidationErrors } from "@/types/event";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

export function validateEvent(input: EventInput): EventValidationErrors {
  const errors: EventValidationErrors = {};

  if (!input.title.trim()) errors.title = "Title is required.";
  if (!input.slug.trim()) errors.slug = "Slug is required.";
  else if (!SLUG_PATTERN.test(input.slug)) errors.slug = "Use lowercase letters, numbers, and hyphens only.";
  if (!input.eventType.trim()) errors.eventType = "Event type is required.";
  if (!input.theme.trim()) errors.theme = "Theme is required.";
  if (input.published && input.status !== "published") {
    errors.published = "Only events with Published status can be publicly visible.";
  }
  if (input.mapLink && !isValidMediaLocation(input.mapLink)) errors.mapLink = "Enter a valid URL.";
  if (input.heroImage && !isValidMediaLocation(input.heroImage)) errors.heroImage = "Enter a valid URL or a /public path.";
  if (input.coverVideo && !isValidMediaLocation(input.coverVideo)) errors.coverVideo = "Enter a valid URL or a /public path.";
  if (input.ogImage && !isValidMediaLocation(input.ogImage)) errors.ogImage = "Enter a valid URL or a /public path.";
  if (input.metaTitle.length > 70) errors.metaTitle = "Keep the meta title at 70 characters or fewer.";
  if (input.metaDescription.length > 160) errors.metaDescription = "Keep the meta description at 160 characters or fewer.";

  return errors;
}

export function hasEventValidationErrors(errors: EventValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
