"use client";

import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Sparkles,
  UtensilsCrossed,
  Music,
  Heart,
  Car,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const icons = [Sparkles, ClipboardCheck, UtensilsCrossed, Music, Heart, Car];
const times = [
  "9:15 AM",
  "10:00 AM",
  "11:30 AM",
  "12:30 PM",
  "1:00 PM",
  "3:30 PM",
];

export default function PoruwaTimeline() {
  const { t, isSinhala } = useLanguage();

  return (
    <section id="timeline" className="bg-cream px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p
            className={`font-display text-lg text-gold-dark ${
              isSinhala ? "font-sinhala tracking-wide" : "uppercase tracking-[0.3em]"
            }`}
          >
            {t.timeline.bigDay}
          </p>
          <h2
            className={`mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.timeline.heading}
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
        </motion.div>

        <div className="relative mt-16">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
            className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-gold via-gold/60 to-gold/10 sm:left-1/2"
          />
          <ul className="space-y-10">
            {t.timeline.events.map((event, idx) => {
              const Icon = icons[idx];
              const isLeft = idx % 2 === 0;
              return (
                <motion.li
                  key={event.title}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 14,
                    delay: idx * 0.12,
                  }}
                  className={`relative flex items-center gap-5 pl-16 sm:w-1/2 sm:pl-0 ${
                    isLeft
                      ? "sm:mr-auto sm:flex-row sm:pr-10 sm:text-right"
                      : "sm:ml-auto sm:flex-row-reverse sm:pl-10"
                  }`}
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 12,
                      delay: idx * 0.12 + 0.2,
                    }}
                    whileHover={{ scale: 1.15 }}
                    className="absolute left-6 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ruby-gradient text-gold ring-4 ring-cream sm:left-auto sm:right-[-22px] sm:translate-x-1/2"
                  >
                    <Icon size={18} />
                  </motion.span>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="rounded-xl bg-ivory p-5 card-shadow"
                  >
                    <p className="font-serif text-lg font-semibold text-gold-dark">
                      {times[idx]}
                    </p>
                    <p
                      className={`mt-1 font-sans text-base font-medium text-ruby ${
                        isSinhala ? "font-sinhala" : ""
                      }`}
                    >
                      {event.title}
                    </p>
                    <p
                      className={`mt-1 font-sans text-sm text-[#4A2020]/80 ${
                        isSinhala ? "font-sinhala" : ""
                      }`}
                    >
                      {event.description}
                    </p>
                  </motion.div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
