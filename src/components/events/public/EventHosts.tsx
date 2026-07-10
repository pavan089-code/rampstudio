import type { Event } from "@/types/event";

import EventSection from "./EventSection";

export default function EventHosts({ event }: { event: Event }) {
  const hosts = event.hosts.filter((host) => host.name || host.role || host.description || host.image);
  if (hosts.length === 0) return null;

  return (
    <EventSection id="hosts" eyebrow="Hosts & People" title="The people at the heart of this event">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {hosts.map((host) => (
          <article key={host.id} className="group">
            {host.image ? (
              <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-white/[0.035]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={host.image}
                  alt={host.name ? `${host.name} portrait` : ""}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
            ) : null}
            {host.role ? <p className="text-[11px] uppercase tracking-[0.24em] text-[#d0ad72]">{host.role}</p> : null}
            {host.name ? <h3 className="mt-3 font-serif text-3xl leading-tight text-white">{host.name}</h3> : null}
            {host.description ? <p className="mt-4 text-sm leading-7 text-white/58">{host.description}</p> : null}
          </article>
        ))}
      </div>
    </EventSection>
  );
}
