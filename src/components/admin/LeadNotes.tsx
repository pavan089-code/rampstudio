"use client";

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  addLeadNote,
  deleteLeadNote,
  subscribeToNotes,
  updateLeadNote,
} from "@/lib/bookings";
import { useAdminClientAuth } from "@/hooks/useAuth";
import type { LeadNote } from "@/types/booking";

function formatDate(value: LeadNote["createdAt"]) {
  if (!value) return "Just now";

  return value.toDate().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadNotes({ bookingId }: { bookingId: string }) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const { status } = useAdminClientAuth();

  useEffect(() => {
    if (status === "checking") return;

    if (status !== "authenticated") {
      const timeout = window.setTimeout(() => {
        setNotes([]);
        setError("Please sign in to load lead notes.");
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    return subscribeToNotes(
      bookingId,
      (items) => {
        setNotes(items);
        setError("");
      },
      (firestoreError) => {
        console.error("[admin/bookings/notes] Firestore listener failed", {
          code: firestoreError.code,
          message: firestoreError.message,
        });
        setError("Unable to load lead notes.");
      }
    );
  }, [bookingId, status]);

  const handleAddNote = async () => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    setError("");

    try {
      await addLeadNote(bookingId, content);
      setContent("");
    } catch {
      setError("Unable to save this note.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;

    setError("");

    try {
      await updateLeadNote(bookingId, noteId, editingContent);
      setEditingId("");
      setEditingContent("");
    } catch {
      setError("Unable to update this note.");
    }
  };

  return (
    <section className="border border-white/10 bg-white/[0.025] p-5">
      <h2 className="font-serif text-3xl text-white">Lead Notes</h2>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="Add a private CRM note"
          className="field-surface w-full resize-none px-4 py-3 text-sm"
        />
        <button
          type="button"
          onClick={handleAddNote}
          disabled={isSaving || !content.trim()}
          className="w-fit border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 text-sm font-medium text-black transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSaving ? "Saving" : "Add Note"}
        </button>
      </div>

      <div className="mt-7 space-y-4">
        {notes.length === 0 && (
          <p className="border border-white/10 bg-black/20 p-5 text-sm text-white/55">
            No notes yet.
          </p>
        )}

        {notes.map((note) => (
          <article key={note.id} className="border border-white/10 p-4">
            {editingId === note.id ? (
              <div className="grid gap-3">
                <textarea
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  rows={3}
                  className="field-surface w-full resize-none px-4 py-3 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateNote(note.id)}
                    className="flex h-9 w-9 items-center justify-center border border-emerald-400/30 text-emerald-200"
                    aria-label="Save note"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId("")}
                    className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/60"
                    aria-label="Cancel edit"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-7 text-white/75">
                  {note.content}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.14em] text-white/35">
                    {formatDate(note.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditingContent(note.content);
                      }}
                      className="flex h-8 w-8 items-center justify-center border border-white/10 text-white/60 transition hover:text-white"
                      aria-label="Edit note"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteLeadNote(bookingId, note.id)}
                      className="flex h-8 w-8 items-center justify-center border border-red-400/20 text-red-200 transition hover:bg-red-400/10"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
