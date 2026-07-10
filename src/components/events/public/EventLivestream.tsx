import type { Event, ResolvedEventLifecycle } from "@/types/event";
import { normalizeYouTubeUrl } from "@/lib/events/youtube";

import EventLivestreamEmbed from "./EventLivestreamEmbed";
import EventSection from "./EventSection";

function formatDateTime(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getLivestreamState(event: Event, lifecycle: ResolvedEventLifecycle): "upcoming" | "available" | "ended" {
  const now = Date.now();
  const startTime = event.media.livestreamStartDateTime ? new Date(event.media.livestreamStartDateTime).getTime() : Number.NaN;
  const endTime = event.media.livestreamEndDateTime ? new Date(event.media.livestreamEndDateTime).getTime() : Number.NaN;

  if (event.media.livestreamStatus === "ended") return "ended";
  if (event.media.livestreamStatus === "live") return "available";
  if (Number.isFinite(endTime) && now > endTime) return "ended";
  if (lifecycle.phase === "after") return "ended";
  if (Number.isFinite(startTime) && now < startTime) return "upcoming";
  if (lifecycle.phase === "before") return "upcoming";
  return "available";
}

export default function EventLivestream({ event, lifecycle }: { event: Event; lifecycle: ResolvedEventLifecycle }) {
  if (!event.sections.livestream || !event.media.livestreamEnabled || event.media.livestreamProvider !== "youtube") return null;

  const normalized = normalizeYouTubeUrl(event.media.livestreamUrl);
  if (!normalized) return null;

  const state = getLivestreamState(event, lifecycle);
  const title = event.media.livestreamTitle || event.media.livestreamLabel || (lifecycle.phase === "after" ? "Livestream replay" : "Watch the celebration live");
  const description = event.media.livestreamDescription;
  const startLabel = formatDateTime(event.media.livestreamStartDateTime);
  const endedMessage = event.media.livestreamFallbackMessage || "This livestream has ended.";
  const shouldRenderEmbed = state !== "ended" || event.media.livestreamReplayEnabled;

  return (
    <EventSection id="livestream" eyebrow={lifecycle.phase === "live" ? "Watch Live" : "Livestream"} title={title}>
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
        <div>
          <p className="inline-flex border border-[#d0ad72]/40 px-3 py-2 text-xs uppercase tracking-[0.22em] text-[#d0ad72]">
            {state === "upcoming" ? "Starting soon" : state === "ended" ? "Ended" : "Live now"}
          </p>
          {description ? <p className="mt-5 max-w-xl text-sm leading-7 text-white/58">{description}</p> : null}
          {state === "upcoming" && startLabel ? (
            <p className="mt-5 text-sm uppercase tracking-[0.16em] text-white/42">Begins {startLabel}</p>
          ) : null}
          {state === "ended" && !shouldRenderEmbed ? <p className="mt-5 text-sm leading-7 text-white/58">{endedMessage}</p> : null}
        </div>

        {shouldRenderEmbed ? (
          <div className="overflow-hidden border border-white/10 bg-black">
            <EventLivestreamEmbed src={normalized.embedUrl} title={title} />
            {state === "ended" ? <p className="border-t border-white/10 px-4 py-3 text-xs uppercase tracking-[0.16em] text-white/42">{endedMessage}</p> : null}
          </div>
        ) : (
          <div className="grid aspect-video place-items-center border border-white/10 bg-white/[0.025] p-6 text-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">{state === "ended" ? "Stream ended" : "Stream placeholder"}</p>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/58">
                {state === "ended" ? endedMessage : "The video player will appear when the livestream is available."}
              </p>
            </div>
          </div>
        )}
      </div>
    </EventSection>
  );
}
