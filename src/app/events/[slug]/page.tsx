import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicEventBySlug } from "@/lib/events/event-server-service";

export const dynamic = "force-dynamic";

function formatEventDate(value: string): string {
  if (!value) return "Date to be announced";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return { title: "Event not found | Ramp Studio" };

  const title = event.metaTitle || `${event.title} | Ramp Studio`;
  const description = event.metaDescription || [formatEventDate(event.eventDate), event.venue].filter(Boolean).join(" · ");
  const image = event.ogImage || event.heroImage;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: image ? [{ url: image }] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  return (
    <main className={`event-microsite event-theme-${event.theme} relative flex min-h-screen items-end overflow-hidden bg-[#080706] text-white`}>
      {event.heroImage ? (
        // A native image accepts Firebase Storage and client-provided CDN URLs without broadening Next image host permissions.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_24%,rgba(198,164,108,0.2),transparent_38%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15" />
      <div className="event-hero-content relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-40 sm:px-10 sm:pb-24 lg:px-16 lg:pb-28">
        <p className="text-xs uppercase tracking-[0.28em] text-[#d0ad72]">{formatEventDate(event.eventDate)}</p>
        <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.96] text-balance sm:text-7xl lg:text-8xl">{event.title}</h1>
        <p className="mt-7 flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-white/70 sm:text-base">
          <span className="h-px w-8 bg-[#c6a46c]" aria-hidden="true" />
          {event.venue || "Venue to be announced"}
        </p>
      </div>
    </main>
  );
}
