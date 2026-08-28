"use client";

import { motion } from "framer-motion";
import {
  Shirt,
  ParkingCircle,
  Baby,
  Gift,
  Camera,
  CloudRain,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const icons: LucideIcon[] = [Shirt, ParkingCircle, Baby, Gift, Camera, CloudRain];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function GoodToKnowSection() {
  const { t, isSinhala } = useLanguage();

  return (
    <section
      id="good-to-know"
      className="relative overflow-hidden px-6 py-24 sm:py-32"
    >
      {/* Background video, scoped to just this section, with a ruby wash
          overlay so the cards & text above stay perfectly legible. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/video/intro-cinematicww.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-ivory/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/85 to-ivory" />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className={`font-display text-lg text-gold-dark ${
              isSinhala ? "font-sinhala tracking-wide" : "uppercase tracking-[0.3em]"
            }`}
          >
            {t.goodToKnow.label}
          </motion.p>
          <h2
            className={`mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.goodToKnow.heading}
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 h-px w-24 bg-gold"
          />
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.goodToKnow.items.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  type: "spring",
                  stiffness: 110,
                  damping: 16,
                  delay: (idx % 3) * 0.12,
                }}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center gap-4 rounded-2xl bg-cream/95 p-8 text-center card-shadow backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 12,
                    delay: (idx % 3) * 0.12 + 0.15,
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-ruby-gradient text-gold shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                >
                  <Icon size={24} />
                </motion.span>
                <h3
                  className={`font-serif text-xl font-semibold text-ruby ${
                    isSinhala ? "font-sinhala" : ""
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`font-sans text-sm leading-relaxed text-[#4A2020]/80 ${
                    isSinhala ? "font-sinhala" : ""
                  }`}
                >
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
