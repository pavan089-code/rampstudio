"use client";

import { CalendarDays, Clock, Copy, ExternalLink, MapPin, Share2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Countdown } from "@/components/events/Countdown";
import EventGallery from "@/components/events/EventGallery";
import { Guestbook, RsvpForm } from "@/components/events/EventForms";
import { EVENT_THEMES, extractYouTubeId } from "@/lib/events/config";
import type { EventRecord } from "@/types/event";

export default function EventExperience({ event }: { event: EventRecord }) {
  const theme = EVENT_THEMES[event.theme as keyof typeof EVENT_THEMES] || EVENT_THEMES["royal-gold"];
  const eventMoment = event.eventDate ? new Date(`${event.eventDate}T${event.eventTime || "00:00"}`) : null;
  const [passed, setPassed] = useState(false);
  const videoId = extractYouTubeId(event.youtubeLive);

  useEffect(() => {
    const updatePassedState = window.setTimeout(() => {
      const eventTimestamp = event.eventDate
        ? new Date(`${event.eventDate}T${event.eventTime || "00:00"}`).getTime()
        : null;
      setPassed(eventTimestamp !== null && eventTimestamp < Date.now());
    }, 0);

    return () => window.clearTimeout(updatePassedState);
  }, [event.eventDate, event.eventTime]);
  const track = useCallback((metric:string) => { fetch(`/api/events/${event.id}/analytics`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({metric,source:document.referrer?new URL(document.referrer).hostname:"direct"}),keepalive:true}).catch(()=>undefined); },[event.id]);
  useEffect(()=>{const key=`ramp-event-${event.id}`;track("views");if(!localStorage.getItem(key)){localStorage.setItem(key,"1");track("uniqueVisitors");}},[event.id,track]);
  const share = async () => { track("shareCount"); if(navigator.share) await navigator.share({title:event.title,url:location.href}); else { await navigator.clipboard.writeText(location.href); } };
  const section = event.sections;
  return <main className="event-experience min-h-screen" style={{"--event-bg":theme.background,"--event-surface":theme.surface,"--event-text":theme.text,"--event-muted":theme.muted,"--event-accent":event.backgroundAccent||theme.accent,"--event-font":theme.font,"--event-radius":theme.radius} as React.CSSProperties}>
    {section.hero && <header className="relative flex min-h-[92svh] items-end overflow-hidden px-5 py-16 sm:px-10 lg:px-16">{event.heroImage||event.coverImage?<Image src={event.heroImage||event.coverImage} alt={event.title} fill priority sizes="100vw" className="object-cover"/>:<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,var(--event-accent),transparent_42%)] opacity-30"/>}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10"/><div className="relative z-10 mx-auto w-full max-w-6xl text-white"><p className="event-kicker">{event.eventType}</p><h1 className="mt-5 max-w-4xl text-5xl leading-[.98] sm:text-7xl lg:text-8xl">{event.title}</h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/75 sm:text-base">{event.hostNames}</p>{section.footer&&event.settings.showShare&&<button onClick={share} className="mt-8 flex items-center gap-2 border border-white/30 px-5 py-3 text-sm"><Share2 className="h-4 w-4"/> Share this event</button>}</div></header>}
    {section.countdown && eventMoment && !passed && <Countdown date={eventMoment.toISOString()}/>} 
    {section.details && <section className="event-section"><div className="mx-auto max-w-5xl text-center"><p className="event-kicker">You are invited</p><h2 className="event-heading">The celebration</h2><p className="mx-auto mt-6 max-w-2xl leading-8 opacity-70">{event.description}</p><div className="mt-10 grid gap-px overflow-hidden sm:grid-cols-3"><div className="event-surface p-7"><CalendarDays className="mx-auto h-5 w-5"/><p className="mt-4">{event.eventDate||"Date to be announced"}</p></div><div className="event-surface p-7"><Clock className="mx-auto h-5 w-5"/><p className="mt-4">{event.eventTime||"Time to be announced"}</p></div><div className="event-surface p-7"><MapPin className="mx-auto h-5 w-5"/><p className="mt-4">{event.venue||"Venue to be announced"}</p></div></div>{event.dressCode&&<p className="mt-6 text-sm opacity-60">Dress code · {event.dressCode}</p>}</div></section>}
    {section.timeline&&event.timeline.length>0&&<section className="event-section"><div className="mx-auto max-w-3xl"><p className="event-kicker text-center">Order of celebration</p><h2 className="event-heading text-center">Timeline</h2><div className="mt-10 border-l border-[var(--event-accent)]/40">{event.timeline.map(item=><article key={item.id} className="relative pb-10 pl-8 before:absolute before:-left-1.5 before:top-1 before:h-3 before:w-3 before:rounded-full before:bg-[var(--event-accent)]"><p className="text-sm text-[var(--event-accent)]">{item.time}</p><h3 className="mt-2 text-2xl">{item.title}</h3><p className="mt-2 opacity-60">{item.description}</p></article>)}</div></div></section>}
    {section.story&&event.story&&<section className="event-section"><div className="mx-auto max-w-3xl text-center"><p className="event-kicker">Our story</p><h2 className="event-heading">A beautiful beginning</h2><p className="mt-7 whitespace-pre-line leading-8 opacity-70">{event.story}</p></div></section>}
    {section.family&&event.family&&<section className="event-section"><div className="mx-auto max-w-3xl text-center"><p className="event-kicker">Together with family</p><p className="mt-7 whitespace-pre-line text-xl leading-9 opacity-75">{event.family}</p></div></section>}
    {section.livestream&&videoId&&<section className="event-section"><div className="mx-auto max-w-5xl"><div className="text-center"><p className="event-kicker">{event.livestreamState}</p><h2 className="event-heading">Join us live</h2></div><div className="mt-8 aspect-video overflow-hidden bg-black"><iframe onLoad={()=>track("livestreamOpens")} className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={`${event.title} livestream`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/></div></div></section>}
    {section.gallery&&event.gallery.length>0&&<EventGallery items={event.gallery} allowDownloads={event.settings.allowDownloads} onOpen={()=>track("galleryViews")} onDownload={()=>track("photoDownloads")}/>} 
    {section.map&&event.mapsUrl&&<section className="event-section text-center"><p className="event-kicker">Find your way</p><h2 className="event-heading">{event.venue}</h2><p className="mx-auto mt-5 max-w-xl leading-7 opacity-65">{event.address}</p><a href={event.mapsUrl} target="_blank" rel="noreferrer" className="event-button mx-auto mt-7 inline-flex items-center gap-2"><ExternalLink className="h-4 w-4"/> Open Maps</a></section>}
    {section.rsvp&&<RsvpForm eventId={event.id}/>} {section.guestbook&&event.settings.allowGuestbook&&<Guestbook eventId={event.id}/>} 
    {section.thankYou&&passed&&<section className="event-section text-center"><p className="event-kicker">With gratitude</p><h2 className="event-heading">Thank you for celebrating with us</h2><p className="mx-auto mt-6 max-w-xl leading-8 opacity-65">The day has passed, but the memories live here.</p></section>}
    {section.footer&&<footer className="border-t border-current/10 px-5 py-10 text-center text-xs uppercase tracking-[.2em] opacity-50">{event.hashtag||event.title} · An experience by Ramp Studio</footer>}
  </main>;
}
