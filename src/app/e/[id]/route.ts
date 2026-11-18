import { NextResponse } from "next/server";
import { getPublicEventSlugById } from "@/lib/events/event-server-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slug = await getPublicEventSlugById(id);
  if (!slug) return new NextResponse("Event not found", { status: 404 });
  // A temporary redirect ensures a later slug change is reflected by existing codes.
  return NextResponse.redirect(new URL(`/events/${encodeURIComponent(slug)}`, request.url), 307);
}
