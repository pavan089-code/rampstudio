"use client";

import { CalendarHeart, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AdminLayout from "@/components/admin/AdminLayout";
import { EventService } from "@/lib/events";
import type { Event, EventStatus } from "@/types/event";

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | EventStatus>("all");
  const [error, setError] = useState("");

  useEffect(() => EventService.subscribe(setEvents, () => setError("Unable to load events.")), []);

  const visibleEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesStatus = status === "all" || event.status === status;
      const matchesSearch = !term || `${event.title} ${event.eventType} ${event.slug}`.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [events, search, status]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-gold)]">Microsite engine</p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Events</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">Create and publish focused event experiences with their own shareable URL.</p>
          </div>
          <Link href="/admin/events/new" className="btn-primary inline-flex w-fit items-center gap-2 text-sm"><Plus className="h-4 w-4" />Create event</Link>
        </div>

        <div className="grid gap-3 border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-[1fr_12rem]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <span className="sr-only">Search events</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events" className="field-surface w-full py-3 pl-11 pr-4" />
          </label>
          <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="field-surface px-4">
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {error ? <p role="alert" className="border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm text-red-100">{error}</p> : null}

        <div className="overflow-x-auto border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.15em] text-white/45">
              <tr><th className="p-4 font-normal">Event</th><th className="p-4 font-normal">Date</th><th className="p-4 font-normal">Status</th><th className="p-4 text-right font-normal">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {visibleEvents.map((event) => (
                <tr key={event.id} className="transition hover:bg-white/[0.02]">
                  <td className="p-4">
                    <Link href={`/admin/events/${event.id}`} className="font-medium text-white transition hover:text-[var(--accent-gold)]">{event.title}</Link>
                    <p className="mt-1 text-xs text-white/40">/events/{event.slug} · {event.eventType}</p>
                  </td>
                  <td className="p-4 text-white/55">{event.eventDate || "Unscheduled"}</td>
                  <td className="p-4"><span className={`border px-2 py-1 text-xs capitalize ${event.published ? "border-[var(--accent-gold)]/35 text-[var(--accent-soft)]" : "border-white/10 text-white/50"}`}>{event.status}</span></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      {event.published ? <a href={`/events/${event.slug}`} target="_blank" rel="noreferrer" className="p-2 text-white/55 transition hover:text-white" title="View event"><Eye className="h-4 w-4" /></a> : null}
                      <Link href={`/admin/events/${event.id}`} className="p-2 text-white/55 transition hover:text-white" title="Edit event"><Pencil className="h-4 w-4" /></Link>
                      <Link href={`/admin/events/${event.id}/delete`} className="p-2 text-red-300/70 transition hover:text-red-200" title="Delete event"><Trash2 className="h-4 w-4" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleEvents.length === 0 ? (
            <div className="grid min-h-64 place-items-center px-6 text-center">
              <div><CalendarHeart className="mx-auto h-7 w-7 text-[var(--accent-gold)]/60" /><p className="mt-4 text-white/55">{events.length ? "No events match these filters." : "No events yet."}</p></div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
