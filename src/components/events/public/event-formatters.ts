import type { EventScheduleItem } from "@/types/event";

export function formatEventDate(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatEventTime(value: string): string {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatTimeRange(startTime: string, endTime: string): string {
  const start = formatEventTime(startTime);
  const end = formatEventTime(endTime);
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

export function getScheduleDateLabel(item: EventScheduleItem): string {
  return [formatEventDate(item.date), formatTimeRange(item.startTime, item.endTime)]
    .filter(Boolean)
    .join(" / ");
}

export function getEventDateTimeLabel(eventDate: string, eventTime: string): string {
  return [formatEventDate(eventDate), formatEventTime(eventTime)].filter(Boolean).join(" / ");
}

export function getCountdownTarget(eventDate: string, eventTime: string): string {
  if (!eventDate) return "";
  return `${eventDate}T${eventTime || "00:00"}:00`;
}

