import type { Event, EventLifecycleMode, EventLifecyclePhase, ResolvedEventLifecycle } from "@/types/event";

const DEFAULT_TIMEZONE = "Asia/Kolkata";
const DEFAULT_EVENT_DURATION_MS = 24 * 60 * 60 * 1000;
const VALID_PHASES: EventLifecyclePhase[] = ["before", "live", "after"];

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function isValidManualMode(mode: EventLifecycleMode): mode is EventLifecyclePhase {
  return VALID_PHASES.includes(mode as EventLifecyclePhase);
}

function getSafeTimezone(value: string): string {
  const timezone = value || DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function parseDateTimeParts(value: string, fallbackTime: string): DateTimeParts | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) return null;

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4] ?? fallbackTime.slice(0, 2)),
    minute: Number(match[5] ?? fallbackTime.slice(3, 5)),
    second: Number(match[6] ?? "0"),
  };

  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
  if (
    utc.getUTCFullYear() !== parts.year ||
    utc.getUTCMonth() !== parts.month - 1 ||
    utc.getUTCDate() !== parts.day ||
    utc.getUTCHours() !== parts.hour ||
    utc.getUTCMinutes() !== parts.minute ||
    utc.getUTCSeconds() !== parts.second
  ) {
    return null;
  }

  return parts;
}

function getZonedParts(timestamp: number, timezone: string): DateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const values = Object.fromEntries(formatter.formatToParts(new Date(timestamp)).map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function zonedDateTimeToUtc(parts: DateTimeParts, timezone: string): number {
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  let timestamp = localAsUtc;

  for (let index = 0; index < 3; index += 1) {
    const zoned = getZonedParts(timestamp, timezone);
    const zonedAsUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
    const offset = zonedAsUtc - timestamp;
    const nextTimestamp = localAsUtc - offset;
    if (nextTimestamp === timestamp) break;
    timestamp = nextTimestamp;
  }

  return timestamp;
}

function combineDateTime(date: string, time: string): string {
  if (!date) return "";
  return `${date}T${time || "00:00"}`;
}

function resolveStart(event: Event, timezone: string): number {
  const startValue = combineDateTime(event.eventDate, event.eventTime) || event.lifecycle.startDateTime;
  const startParts = parseDateTimeParts(startValue, "00:00");
  return startParts ? zonedDateTimeToUtc(startParts, timezone) : Number.NaN;
}

function resolveEnd(event: Event, timezone: string, startTime: number): { endTime: number; hasValidEnd: boolean; reason: string } {
  const endValue = combineDateTime(event.eventEndDate, event.eventEndTime) || event.lifecycle.endDateTime;
  const fallbackTime = event.eventEndDate && !event.eventEndTime ? "23:59" : "00:00";
  const endParts = parseDateTimeParts(endValue, fallbackTime);

  if (endParts) {
    const explicitEnd = zonedDateTimeToUtc(endParts, timezone);
    if (Number.isFinite(explicitEnd) && explicitEnd > startTime) {
      return { endTime: explicitEnd, hasValidEnd: true, reason: "configured end" };
    }
  }

  return {
    endTime: startTime + DEFAULT_EVENT_DURATION_MS,
    hasValidEnd: false,
    reason: endValue ? "invalid end, defaulted to 24 hours after start" : "missing end, defaulted to 24 hours after start",
  };
}

export function resolveEventLifecycle(event: Event, now: Date = new Date()): ResolvedEventLifecycle {
  const mode = event.lifecycle.mode;
  const timezone = getSafeTimezone(event.lifecycle.timezone || event.timezone);
  const nowTime = now.getTime();

  if (isValidManualMode(mode)) {
    return {
      phase: mode,
      mode,
      timezone,
      startAt: "",
      endAt: "",
      hasValidStart: false,
      hasValidEnd: false,
      reason: "manual override",
    };
  }

  const startTime = resolveStart(event, timezone);
  if (!Number.isFinite(startTime)) {
    return {
      phase: "before",
      mode: "auto",
      timezone,
      startAt: "",
      endAt: "",
      hasValidStart: false,
      hasValidEnd: false,
      reason: "missing or invalid start, defaulted to before",
    };
  }

  const end = resolveEnd(event, timezone, startTime);
  const phase: EventLifecyclePhase = nowTime < startTime ? "before" : nowTime < end.endTime ? "live" : "after";

  return {
    phase,
    mode: "auto",
    timezone,
    startAt: new Date(startTime).toISOString(),
    endAt: new Date(end.endTime).toISOString(),
    hasValidStart: true,
    hasValidEnd: end.hasValidEnd,
    reason: end.reason,
  };
}
