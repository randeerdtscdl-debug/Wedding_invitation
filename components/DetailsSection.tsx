"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function DetailsSection() {
  const { t, isSinhala } = useLanguage();

  return (
    <section id="details" className="bg-ivory px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p
            className={`font-display text-lg text-gold-dark ${
              isSinhala ? "font-sinhala tracking-wide" : "uppercase tracking-[0.3em]"
            }`}
          >
            {t.details.withGreatJoy}
          </p>
          <h2
            className={`mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.details.heading}
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
        </motion.div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="rounded-2xl bg-cream p-8 text-center card-shadow"
          >
            <p
              className={`font-display text-sm text-gold-dark ${
                isSinhala ? "font-sinhala tracking-wide" : "uppercase tracking-[0.3em]"
              }`}
            >
              {t.details.bride}
            </p>
            <h3 className="mt-3 font-serif text-3xl font-semibold text-ruby">
              Umini
            </h3>
            <p
              className={`mt-4 font-sans text-sm leading-relaxed text-[#4A2020] ${
                isSinhala ? "font-sinhala" : ""
              }`}
            >
              {t.details.belovedDaughterOf}
              <br />
              <span className="font-medium">Mr. Jagath Gangabadage</span>
              <br />
              &amp;
              <br />
              <span className="font-medium">Mrs. Anomali Kariyawasam</span>
            </p>
            <a
              href="tel:+94719092469"
              aria-label="Call the Bride"
              className={`mt-6 inline-flex items-center gap-2 rounded-full bg-ruby-gradient px-7 py-2.5 text-sm font-medium text-ivory shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 ${
                isSinhala ? "font-sinhala" : "tracking-wide"
              }`}
            >
              <Phone size={16} /> {t.details.contactBride}
            </a>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="rounded-2xl bg-cream p-8 text-center card-shadow"
          >
            <p
              className={`font-display text-sm text-gold-dark ${
                isSinhala ? "font-sinhala tracking-wide" : "uppercase tracking-[0.3em]"
              }`}
            >
              {t.details.groom}
            </p>
            <h3 className="mt-3 font-serif text-3xl font-semibold text-ruby">
              Randeera
            </h3>
            <p
              className={`mt-4 font-sans text-sm leading-relaxed text-[#4A2020] ${
                isSinhala ? "font-sinhala" : ""
              }`}
            >
              {t.details.belovedSonOf}
              <br />
              <span className="font-medium">Mr. Dammika Withanage</span>
              <br />
              &amp;
              <br />
              <span className="font-medium">Mrs. Prasadi Perera</span>
            </p>
            <a
              href="tel:+94713670967"
              aria-label="Call the Groom"
              className={`mt-6 inline-flex items-center gap-2 rounded-full bg-ruby-gradient px-7 py-2.5 text-sm font-medium text-ivory shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 ${
                isSinhala ? "font-sinhala" : "tracking-wide"
              }`}
            >
              <Phone size={16} /> {t.details.contactGroom}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.8 }}
          className="mx-auto mt-16 max-w-2xl rounded-2xl border border-gold/40 bg-ruby-gradient p-8 text-center text-ivory card-shadow"
        >
          <h4
            className={`font-serif text-2xl font-semibold text-gold ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.details.poruwaCeremony}
          </h4>
          <p
            className={`mt-3 font-sans text-sm leading-relaxed text-ivory/90 ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.details.commencesAt}{" "}
            <span className="font-semibold text-gold">9.15 A.M.</span>{" "}
            {t.details.poruwaDescSuffix}
          </p>
          <p
            className={`mt-4 font-sans text-xs text-ivory/60 ${
              isSinhala ? "font-sinhala" : "uppercase tracking-[0.2em]"
            }`}
          >
            {t.details.rsvpBy}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
