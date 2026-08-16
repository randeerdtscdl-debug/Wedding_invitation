"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background video loop — falls back to the poster image if the file is missing */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/video/hero-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-ruby-dark/70 via-ruby-dark/50 to-cream" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-4 font-display text-lg uppercase tracking-[0.4em] text-gold"
        >
          Together With Their Families
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9 }}
          className="font-serif text-6xl sm:text-8xl font-semibold text-ivory drop-shadow-lg"
        >
          Umini <span className="text-gold">&amp;</span> Randeera
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="mt-5 font-display text-2xl italic text-ivory/90"
        >
          are getting married
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.9 }}
          className="mt-2 font-sans text-sm sm:text-base uppercase tracking-[0.3em] text-ivory/80"
        >
          Thursday · 22nd October 2026 · Monarch Imperial
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9 }}
          className="mt-10"
        >
          <CountdownTimer />
        </motion.div>

        <motion.a
          href="#details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-14 flex flex-col items-center gap-1 text-ivory/80"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            <ChevronDown size={22} />
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}
