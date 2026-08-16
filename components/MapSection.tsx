"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const VENUE_QUERY = encodeURIComponent(
  "Monarch Imperial, Sri Jayawardenepura Kotte, Sri Lanka"
);

export default function MapSection() {
  return (
    <section id="venue" className="bg-ivory px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-display text-lg uppercase tracking-[0.3em] text-gold-dark">
            Join Us At
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby">
            Monarch Imperial
          </h2>
          <p className="mt-3 flex items-center justify-center gap-2 font-sans text-sm text-[#4A2020]/80">
            <MapPin size={16} className="text-gold-dark" />
            Sri Jayawardenepura Kotte, Sri Lanka
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-10 overflow-hidden rounded-2xl card-shadow"
        >
          <iframe
            title="Monarch Imperial location map"
            src={`https://www.google.com/maps?q=${VENUE_QUERY}&output=embed`}
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        <motion.a
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          href={`https://www.google.com/maps/dir/?api=1&destination=${VENUE_QUERY}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-ruby-gradient px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-transform hover:scale-105"
        >
          Get Directions
        </motion.a>
      </div>
    </section>
  );
}
