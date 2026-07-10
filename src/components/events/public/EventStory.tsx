import type { Event } from "@/types/event";

import EventSection from "./EventSection";

export default function EventStory({ event }: { event: Event }) {
  const story = event.presentation.story || event.presentation.message || event.presentation.subtitle;
  if (!story) return null;

  return (
    <EventSection id="story" eyebrow="Story" title="A celebration held in memory and light">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <p className="text-xs uppercase tracking-[0.28em] text-white/35">{event.eventType}</p>
        <div className="max-w-3xl whitespace-pre-line font-serif text-2xl leading-relaxed text-white/82 sm:text-3xl">
          {story}
        </div>
      </div>
    </EventSection>
  );
}
