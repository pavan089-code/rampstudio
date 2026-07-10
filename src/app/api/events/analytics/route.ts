import { NextRequest, NextResponse } from "next/server";

import {
  assertPublishedEventForAnalytics,
  isEventAnalyticsType,
  recordEventAnalytics,
} from "@/lib/events/analytics";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ accepted: false, error: "Request too large." }, { status: 413 });
  }

  const ip = getRequestIp(request.headers);
  const limit = checkRateLimit({
    key: `event-analytics:${ip}`,
    limit: 60,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!limit.allowed) {
    return NextResponse.json({ accepted: false, error: "Too many requests." }, { status: 429 });
  }

  try {
    const payload = (await request.json()) as { eventId?: unknown; type?: unknown };
    const eventId = typeof payload.eventId === "string" ? payload.eventId.trim() : "";
    const type = payload.type;

    if (!eventId || !isEventAnalyticsType(type)) {
      return NextResponse.json({ accepted: false, error: "Invalid analytics event." }, { status: 400 });
    }

    const eventSnapshot = await assertPublishedEventForAnalytics(eventId);
    if (!eventSnapshot) {
      return NextResponse.json({ accepted: false, error: "Event not available." }, { status: 404 });
    }

    await recordEventAnalytics(eventId, type);
    return NextResponse.json({ accepted: true });
  } catch (error) {
    console.error("[api/events/analytics] Unable to record analytics event", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ accepted: false, error: "Unable to record analytics." }, { status: 500 });
  }
}
