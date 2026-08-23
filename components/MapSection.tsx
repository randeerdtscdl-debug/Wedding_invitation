"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin } from "lucide-react";

const VENUE_QUERY = encodeURIComponent(
  "Monarch Imperial, Sri Jayawardenepura Kotte, Sri Lanka"
);

export default function MapSection() {
  return (
    <section id="venue" className="bg-ruby-gradient">
      {/* Full, clearly visible venue photo — only a soft bottom fade so the
          heading stays readable, the rest of the image is untouched. */}
      <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden sm:h-[58vh]">
        <Image
          src="/images/venue-hotel.png"
          alt="Monarch Imperial venue"
          fill
          sizes="1000vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ruby-dark via-ruby-dark/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 text-center sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-display text-lg uppercase tracking-[0.3em] text-gold drop-shadow">
              Join Us At
            </p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-ivory drop-shadow-lg">
              Monarch Imperial
            </h2>
            <p className="mt-3 flex items-center justify-center gap-2 font-sans text-sm text-ivory/90 drop-shadow">
              <MapPin size={16} className="text-gold" />
              Sri Jayawardenepura Kotte, Sri Lanka
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="overflow-hidden rounded-2xl ring-1 ring-gold/30 card-shadow"
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
            className="mt-6 inline-block rounded-full bg-gold-gradient px-8 py-3 text-sm font-semibold uppercase tracking-widest text-ruby-dark shadow-lg transition-transform hover:scale-105"
          >
            Get Directions
          </motion.a>
        </div>
      </div>
    </section>
  );
}
