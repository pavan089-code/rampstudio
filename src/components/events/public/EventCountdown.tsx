"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  complete: boolean;
};

function getCountdown(targetTime: number): CountdownState {
  const remaining = Math.max(0, targetTime - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, complete: remaining <= 0 };
}

export default function EventCountdown({ target, label }: { target: string; label: string }) {
  const targetTime = useMemo(() => {
    if (!target) return Number.NaN;
    const time = new Date(target).getTime();
    return Number.isNaN(time) ? Number.NaN : time;
  }, [target]);
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (!Number.isFinite(targetTime)) return;

    const update = () => setCountdown(getCountdown(targetTime));
    update();

    const timer = window.setInterval(() => {
      const next = getCountdown(targetTime);
      setCountdown(next);
      if (next.complete) window.clearInterval(timer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetTime]);

  if (!Number.isFinite(targetTime)) return null;

  return (
    <section className="border-t border-white/10 px-5 py-16 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d0ad72]">Countdown</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
              {countdown?.complete ? "The event has begun" : "Until the celebration"}
            </h2>
            {label ? <p className="mt-4 text-sm uppercase tracking-[0.16em] text-white/45">{label}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              ["Days", countdown?.days],
              ["Hours", countdown?.hours],
              ["Minutes", countdown?.minutes],
              ["Seconds", countdown?.seconds],
            ].map(([unit, value]) => (
              <div key={unit} className="bg-[#080706] p-5 text-center sm:p-7">
                <p className="font-serif text-4xl text-white sm:text-5xl">{typeof value === "number" ? String(value).padStart(2, "0") : "--"}</p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-white/38">{unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

