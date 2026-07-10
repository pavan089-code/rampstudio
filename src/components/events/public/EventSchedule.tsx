import type { Event, ResolvedEventLifecycle } from "@/types/event";

import EventSection from "./EventSection";
import { getScheduleDateLabel } from "./event-formatters";

function getTodayInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return "";
  }
}

export default function EventSchedule({ event, lifecycle }: { event: Event; lifecycle: ResolvedEventLifecycle }) {
  const schedule = event.schedule
    .filter((item) => item.title || item.description || item.date || item.startTime || item.location)
    .sort((first, second) => first.order - second.order);
  if (schedule.length === 0) return null;

  const today = lifecycle.phase === "live" ? getTodayInTimezone(lifecycle.timezone) : "";
  const todayItems = today ? schedule.filter((item) => item.date === today) : [];
  const otherItems = today ? schedule.filter((item) => item.date !== today) : [];
  const displaySchedule = lifecycle.phase === "live" && todayItems.length > 0 ? todayItems : schedule;
  const title = lifecycle.phase === "live"
    ? todayItems.length > 0 ? "Today's schedule" : "Event-day timeline"
    : lifecycle.phase === "after"
      ? "Event timeline"
      : "A simple timeline for the day";
  const eyebrow = lifecycle.phase === "after" ? "Recap" : "Schedule";

  return (
    <EventSection id="schedule" eyebrow={eyebrow} title={title}>
      {lifecycle.phase === "live" && todayItems.length > 0 && todayItems.length < schedule.length ? (
        <p className="-mt-5 mb-8 max-w-2xl text-sm leading-7 text-white/52">
          Showing the moments scheduled for today. Other configured event moments remain part of the full event timeline.
        </p>
      ) : null}
      <div className="divide-y divide-white/10 border-y border-white/10">
        {displaySchedule.map((item, index) => {
          const dateLabel = getScheduleDateLabel(item);
          return (
            <article key={item.id} className="grid gap-5 py-7 md:grid-cols-[7rem_1fr] md:gap-10">
              <div className="text-xs uppercase tracking-[0.24em] text-white/32">{String(index + 1).padStart(2, "0")}</div>
              <div className="grid gap-3 lg:grid-cols-[1fr_15rem] lg:gap-10">
                <div>
                  {dateLabel ? <p className="text-xs uppercase tracking-[0.2em] text-[#d0ad72]">{dateLabel}</p> : null}
                  <h3 className="mt-2 font-serif text-3xl leading-tight text-white">{item.title || "Event moment"}</h3>
                  {item.description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">{item.description}</p> : null}
                </div>
                {item.location ? <p className="text-sm leading-7 text-white/48 lg:text-right">{item.location}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
      {lifecycle.phase === "live" && todayItems.length > 0 && otherItems.length > 0 ? (
        <div className="mt-10">
          <h3 className="text-xs uppercase tracking-[0.24em] text-white/38">Full event timeline</h3>
          <div className="mt-4 grid gap-3">
            {otherItems.map((item) => (
              <article key={item.id} className="border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#d0ad72]">{getScheduleDateLabel(item)}</p>
                <h4 className="mt-2 font-serif text-xl text-white">{item.title || "Event moment"}</h4>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </EventSection>
  );
}
