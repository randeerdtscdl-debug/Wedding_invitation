"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function DetailsSection() {
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
          <p className="font-display text-lg uppercase tracking-[0.3em] text-gold-dark">
            With Great Joy
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby">
            We Invite You To Celebrate
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
            <p className="font-display text-sm uppercase tracking-[0.3em] text-gold-dark">
              The Bride
            </p>
            <h3 className="mt-3 font-serif text-3xl font-semibold text-ruby">
              Umini
            </h3>
            <p className="mt-4 font-sans text-sm leading-relaxed text-[#4A2020]">
              Beloved daughter of
              <br />
              <span className="font-medium">Mr. Jagath Gangabadage</span>
              <br />
              &amp;
              <br />
              <span className="font-medium">Mrs. Anomali Kariyawasam</span>
            </p>
            <a
              href="tel:+94719092469"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ruby-gradient px-6 py-2.5 text-sm text-ivory transition-transform hover:scale-105"
            >
              <Phone size={16} /> +94 71 909 2469
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
            <p className="font-display text-sm uppercase tracking-[0.3em] text-gold-dark">
              The Groom
            </p>
            <h3 className="mt-3 font-serif text-3xl font-semibold text-ruby">
              Randeera
            </h3>
            <p className="mt-4 font-sans text-sm leading-relaxed text-[#4A2020]">
              Beloved son of
              <br />
              <span className="font-medium">Mr. Dammika Withanage</span>
              <br />
              &amp;
              <br />
              <span className="font-medium">Mrs. Prasadi Perera</span>
            </p>
            <a
              href="tel:+94713670967"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ruby-gradient px-6 py-2.5 text-sm text-ivory transition-transform hover:scale-105"
            >
              <Phone size={16} /> +94 71 367 0967
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
          <h4 className="font-serif text-2xl font-semibold text-gold">
            Poruwa Ceremony
          </h4>
          <p className="mt-3 font-sans text-sm leading-relaxed text-ivory/90">
            Commences at <span className="font-semibold text-gold">9.15 A.M.</span>{" "}
            on Thursday, 22nd October 2026, following traditional Sri Lankan
            rituals at Monarch Imperial, Sri Jayawardenepura Kotte.
          </p>
          <p className="mt-4 font-sans text-xs uppercase tracking-[0.2em] text-ivory/60">
            Kindly RSVP by 10th October 2026
          </p>
        </motion.div>
      </div>
    </section>
  );
}
