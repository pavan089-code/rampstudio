"use client";

import { useEffect, useState } from "react";
import { getGuestbook, submitGuestbook, submitRsvp } from "@/lib/events/events";
import type { GuestbookEntry, RsvpStatus } from "@/types/event";

export function RsvpForm({ eventId }: { eventId: string }) {
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); const form = new FormData(e.currentTarget); try { await submitRsvp(eventId,{ name:String(form.get("name")||"").trim(), phone:String(form.get("phone")||"").trim(), email:String(form.get("email")||"").trim().toLowerCase(), guests:Number(form.get("guests")||1), attending:String(form.get("attending")||"pending") as RsvpStatus, message:String(form.get("message")||"").trim() }); e.currentTarget.reset(); setMessage("Your response has been received. Thank you."); } catch { setMessage("We could not save your RSVP. Please try again."); } finally { setBusy(false); } }
  return <section className="event-section"><div className="mx-auto max-w-2xl"><p className="event-kicker text-center">Kindly respond</p><h2 className="event-heading text-center">RSVP</h2><form onSubmit={submit} className="event-surface mt-8 grid gap-4 p-5 sm:grid-cols-2 sm:p-8"><input required name="name" placeholder="Name" className="event-field" /><input required name="phone" placeholder="Phone" className="event-field" /><input type="email" name="email" placeholder="Email" className="event-field" /><input required min="1" max="20" type="number" name="guests" defaultValue="1" className="event-field" /><select name="attending" className="event-field"><option value="attending">Joyfully attending</option><option value="declined">Unable to attend</option><option value="pending">Not sure yet</option></select><textarea name="message" placeholder="A note for the hosts" className="event-field min-h-28 sm:col-span-2" /><button disabled={busy} className="event-button sm:col-span-2">{busy?"Sending…":"Send RSVP"}</button>{message && <p className="text-sm sm:col-span-2">{message}</p>}</form></div></section>;
}

export function Guestbook({ eventId }: { eventId: string }) {
  const [entries,setEntries]=useState<GuestbookEntry[]>([]); const [notice,setNotice]=useState("");
  useEffect(() => { getGuestbook(eventId,true).then(setEntries).catch(()=>undefined); },[eventId]);
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);try{await submitGuestbook(eventId,String(f.get("name")||""),String(f.get("message")||""));e.currentTarget.reset();setNotice("Your wish is awaiting approval.");}catch{setNotice("Unable to leave your wish right now.");}}
  return <section className="event-section"><div className="mx-auto max-w-4xl"><p className="event-kicker text-center">From the heart</p><h2 className="event-heading text-center">Guestbook</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{entries.slice(0,6).map((entry)=><blockquote key={entry.id} className="event-surface p-6"><p className="leading-7">“{entry.message}”</p><footer className="mt-4 text-sm opacity-60">— {entry.name}</footer></blockquote>)}</div><form onSubmit={submit} className="mx-auto mt-8 grid max-w-2xl gap-4"><input required name="name" placeholder="Your name" className="event-field"/><textarea required maxLength={1000} name="message" placeholder="Leave a wish" className="event-field min-h-28"/><button className="event-button">Add to guestbook</button>{notice&&<p className="text-sm">{notice}</p>}</form></div></section>;
}
