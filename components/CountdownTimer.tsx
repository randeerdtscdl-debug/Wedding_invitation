"use client";

import { useEffect, useState } from "react";

const WEDDING_DATE_ISO = "2026-10-22T09:15:00+05:30"; // Sri Lanka time (IST/SLST, UTC+5:30)

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = new Date(WEDDING_DATE_ISO).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const units: { label: string; value: number }[] = [
    { label: "Days", value: timeLeft?.days ?? 0 },
    { label: "Hours", value: timeLeft?.hours ?? 0 },
    { label: "Minutes", value: timeLeft?.minutes ?? 0 },
    { label: "Seconds", value: timeLeft?.seconds ?? 0 },
  ];

  return (
    <div className="flex gap-3 sm:gap-6">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center rounded-2xl bg-ivory/10 backdrop-blur-md border border-gold/30 px-4 py-3 sm:px-6 sm:py-4 min-w-[70px] sm:min-w-[90px]"
        >
          <span className="font-serif text-3xl sm:text-4xl font-semibold text-gold tabular-nums">
            {timeLeft ? String(unit.value).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-ivory/80">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
