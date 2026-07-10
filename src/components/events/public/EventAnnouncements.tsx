import type { Event, EventAnnouncement, ResolvedEventLifecycle } from "@/types/event";

import EventSection from "./EventSection";

const priorityStyles = {
  normal: "border-white/10 text-white/42",
  important: "border-[#d0ad72]/35 text-[#d0ad72]",
  urgent: "border-red-300/35 text-red-200",
};

const priorityLabels = {
  normal: "Update",
  important: "Important update",
  urgent: "Urgent update",
};

export default function EventAnnouncements({
  event,
  announcements,
  lifecycle,
}: {
  event: Event;
  announcements: EventAnnouncement[];
  lifecycle: ResolvedEventLifecycle;
}) {
  if (!event.sections.announcements) return null;

  const publishedAnnouncements = announcements.filter((announcement) => announcement.published && (announcement.title || announcement.message));
  if (publishedAnnouncements.length === 0) return null;

  return (
    <EventSection
      id="announcements"
      eyebrow={lifecycle.phase === "live" ? "Event-Day Updates" : "Announcements"}
      title={lifecycle.phase === "after" ? "Shared event updates" : lifecycle.phase === "live" ? "Updates for today" : "Updates for the day"}
    >
      <div className="grid gap-4">
        {publishedAnnouncements.map((announcement) => {
          const priority = announcement.priority in priorityStyles ? announcement.priority : "normal";
          const stylePriority = lifecycle.phase === "after" && priority === "urgent" ? "important" : priority;
          const label = lifecycle.phase === "after" && priority === "urgent" ? "Event update" : priorityLabels[priority];
          return (
            <article key={announcement.id} className={`border border-white/10 bg-white/[0.025] p-5 sm:p-6 ${lifecycle.phase === "live" ? "border-[#d0ad72]/25" : ""}`}>
              <p className={`inline-flex border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${priorityStyles[stylePriority]}`}>
                {label}
              </p>
              {announcement.title ? <h3 className="mt-4 font-serif text-2xl leading-tight text-white">{announcement.title}</h3> : null}
              {announcement.message ? <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/62">{announcement.message}</p> : null}
            </article>
          );
        })}
      </div>
    </EventSection>
  );
}
