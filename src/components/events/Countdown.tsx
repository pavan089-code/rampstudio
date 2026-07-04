"use client";

import { useEffect, useState } from "react";

export function Countdown({ date }: { date: string }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(date).getTime() - Date.now()));
  useEffect(() => { const timer = window.setInterval(() => setRemaining(Math.max(0, new Date(date).getTime() - Date.now())), 1000); return () => clearInterval(timer); }, [date]);
  if (!remaining) return null;
  const units = [
    ["Days", Math.floor(remaining / 86400000)],
    ["Hours", Math.floor((remaining / 3600000) % 24)],
    ["Minutes", Math.floor((remaining / 60000) % 60)],
    ["Seconds", Math.floor((remaining / 1000) % 60)],
  ];
  return <section className="event-section text-center"><p className="event-kicker">Until we celebrate</p><div className="mx-auto mt-8 grid max-w-2xl grid-cols-4 gap-2 sm:gap-6">{units.map(([label,value]) => <div key={label} className="event-surface px-2 py-5"><strong className="block text-2xl sm:text-4xl">{String(value).padStart(2,"0")}</strong><span className="mt-2 block text-[10px] uppercase tracking-[.18em] opacity-60">{label}</span></div>)}</div></section>;
}
