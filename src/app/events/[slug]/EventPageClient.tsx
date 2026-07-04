"use client";
import { useEffect, useState } from "react";
import EventExperience from "@/components/events/EventExperience";
import { getPublishedEventBySlug } from "@/lib/events/events";
import type { EventRecord } from "@/types/event";
export default function EventPageClient({slug}:{slug:string}){const[event,setEvent]=useState<EventRecord|null>();useEffect(()=>{getPublishedEventBySlug(slug).then(setEvent).catch(()=>setEvent(null));},[slug]);if(event===undefined)return <main className="grid min-h-screen place-items-center bg-[#080808] text-white/60">Preparing the experience…</main>;if(!event)return <main className="grid min-h-screen place-items-center bg-[#080808] px-5 text-center text-white"><div><p className="text-xs uppercase tracking-[.22em] text-[#c6a46c]">Ramp Studio</p><h1 className="mt-4 font-serif text-4xl">Event not found</h1><p className="mt-4 text-white/55">This experience may be private, archived, or unavailable.</p></div></main>;return <EventExperience event={event}/>;}
