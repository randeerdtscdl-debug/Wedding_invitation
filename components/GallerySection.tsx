"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Replace these paths with the couple's actual pre-wedding shoot photos,
// placed inside /public/images/gallery/.
const GALLERY_IMAGES = [
  "/images/gallery/photo-1.jpg",
  "/images/gallery/photo-2.jpg",
  "/images/gallery/photo-3.jpg",
  "/images/gallery/photo-4.jpg",
  "/images/gallery/photo-5.jpg",
  "/images/gallery/photo-6.jpg",
];

export default function GallerySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const showNext = () =>
    setActiveIndex((prev) =>
      prev === null ? null : (prev + 1) % GALLERY_IMAGES.length
    );
  const showPrev = () =>
    setActiveIndex((prev) =>
      prev === null
        ? null
        : (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
    );

  return (
    <section id="gallery" className="bg-cream px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="font-display text-lg uppercase tracking-[0.3em] text-gold-dark">
            Our Story
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby">
            Moments We Cherish
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {GALLERY_IMAGES.map((src, idx) => (
            <motion.button
              key={src}
              initial={{ opacity: 0, y: 40, scale: 0.9, rotate: idx % 2 === 0 ? -2 : 2 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                type: "spring",
                stiffness: 110,
                damping: 16,
                delay: (idx % 3) * 0.12,
              }}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveIndex(idx)}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl card-shadow"
            >
              <Image
                src={src}
                alt={`Umini & Randeera pre-wedding photo ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.15]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ruby-dark/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gold/0 transition-all duration-300 group-hover:ring-gold/60" />
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ivory/90 px-3 py-1 font-sans text-[10px] uppercase tracking-widest text-ruby opacity-0 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-100"
              >
                View
              </motion.span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox-backdrop fixed inset-0 z-[90] flex items-center justify-center px-4"
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Close gallery"
              className="absolute right-6 top-6 text-ivory/80 hover:text-gold"
            >
              <X size={28} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Previous photo"
              className="absolute left-4 text-ivory/80 hover:text-gold sm:left-8"
            >
              <ChevronLeft size={36} />
            </button>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[70vh] w-full max-w-3xl"
            >
              <Image
                src={GALLERY_IMAGES[activeIndex]}
                alt={`Umini & Randeera pre-wedding photo ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Next photo"
              className="absolute right-4 text-ivory/80 hover:text-gold sm:right-8"
            >
              <ChevronRight size={36} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
