"use client";

import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AdminLayout from "@/components/admin/AdminLayout";
import { EventService } from "@/lib/events";

export default function DeleteEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    EventService.getById(id)
      .then((event) => event ? setTitle(event.title) : setError("Event not found."))
      .catch(() => setError("Unable to load this event."))
      .finally(() => setLoading(false));
  }, [id]);

  async function removeEvent() {
    setDeleting(true);
    setError("");
    try {
      await EventService.delete(id);
      router.replace("/admin/events");
      router.refresh();
    } catch {
      setError("Unable to delete this event. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl">
        <Link href={`/admin/events/${id}`} className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Back to event</Link>
        <section className="mt-8 border border-red-400/20 bg-red-400/[0.05] p-6 sm:p-9">
          <p className="text-xs uppercase tracking-[0.22em] text-red-300">Delete event</p>
          <h1 className="mt-3 font-serif text-4xl">This cannot be undone.</h1>
          {loading ? <p className="mt-6 flex items-center gap-2 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin" />Loading event</p> : (
            <>
              <p className="mt-5 leading-7 text-white/55">You’re about to permanently delete <span className="text-white">{title || "this event"}</span>. Its public microsite will stop working immediately.</p>
              {error ? <p role="alert" className="mt-5 text-sm text-red-200">{error}</p> : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={removeEvent} disabled={deleting || !title} className="inline-flex min-h-12 items-center gap-2 bg-red-300 px-5 text-sm text-black transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{deleting ? "Deleting" : "Delete event"}
                </button>
                <Link href={`/admin/events/${id}`} className="inline-flex min-h-12 items-center border border-white/10 px-5 text-sm text-white/70 transition hover:border-white/25 hover:text-white">Cancel</Link>
              </div>
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
