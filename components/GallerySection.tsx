"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// The couple's pre-wedding shoot photos, placed in /public/images/gallery/.
const GALLERY_IMAGES = Array.from(
  { length: 17 },
  (_, i) => `/images/gallery/photo-${i + 1}.jpg`
);

const SLIDE_DURATION = 4500;

// The "puzzle wall" below the hero slider always shows exactly 9 tiles
// (3 rows × 3 columns) — instead of growing to fit all 17 photos, tiles
// individually swap to a new photo every few seconds with a flip
// animation, so every photo eventually appears without the page growing
// taller.
const TILE_COUNT = 9;
const TILE_SWAP_INTERVAL = 1800;

export default function GallerySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const { t, isSinhala } = useLanguage();

  // Which photo (index into GALLERY_IMAGES) each of the 9 wall tiles is
  // currently showing, plus a "flip key" per tile so React remounts just
  // that tile's inner content when it swaps, triggering its own flip
  // animation independently of the others.
  const [tilePhotos, setTilePhotos] = useState<number[]>(() =>
    Array.from({ length: TILE_COUNT }, (_, i) => i % GALLERY_IMAGES.length)
  );
  const [tileKeys, setTileKeys] = useState<number[]>(() =>
    Array.from({ length: TILE_COUNT }, () => 0)
  );
  const nextPoolPointer = useRef(TILE_COUNT % GALLERY_IMAGES.length);

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

  const nextSlide = useCallback(() => {
    setSlideIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setSlideIndex(
      (prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
    );
  }, []);

  // Auto-advance the hero slider — pauses when the guest interacts with it
  // or when they've opened the full lightbox below.
  useEffect(() => {
    if (!autoPlay || activeIndex !== null) return;
    const timer = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [autoPlay, activeIndex, nextSlide]);

  // Puzzle wall: every tick, swap ONE random tile to the next photo in the
  // pool (skipping any photo already showing on another tile), so the wall
  // feels alive without ever changing size or all flipping at once. Pauses
  // while the lightbox is open.
  useEffect(() => {
    if (activeIndex !== null) return;
    const timer = setInterval(() => {
      setTilePhotos((prev) => {
        const tileToSwap = Math.floor(Math.random() * TILE_COUNT);
        let candidate = nextPoolPointer.current % GALLERY_IMAGES.length;
        let attempts = 0;
        while (prev.includes(candidate) && attempts < GALLERY_IMAGES.length) {
          candidate = (candidate + 1) % GALLERY_IMAGES.length;
          attempts += 1;
        }
        nextPoolPointer.current = (candidate + 1) % GALLERY_IMAGES.length;

        const next = [...prev];
        next[tileToSwap] = candidate;
        setTileKeys((prevKeys) => {
          const nextKeys = [...prevKeys];
          nextKeys[tileToSwap] += 1;
          return nextKeys;
        });
        return next;
      });
    }, TILE_SWAP_INTERVAL);
    return () => clearInterval(timer);
  }, [activeIndex]);

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
          <p
            className={`font-display text-lg text-gold-dark ${
              isSinhala ? "font-sinhala tracking-wide" : "uppercase tracking-[0.3em]"
            }`}
          >
            {t.gallery.ourStory}
          </p>
          <h2
            className={`mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.gallery.heading}
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
        </motion.div>

        {/* Hero slider — a slow, cinematic Ken Burns crossfade through every
            photo, front and center above the browsable grid. */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative mx-auto mt-14 aspect-[4/5] w-full max-w-xl overflow-hidden rounded-[2rem] card-shadow sm:aspect-[16/10] sm:max-w-none"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.1, ease: "easeInOut" },
                scale: { duration: SLIDE_DURATION / 1000 + 0.6, ease: "linear" },
              }}
              className="absolute inset-0"
            >
              <Image
                src={GALLERY_IMAGES[slideIndex]}
                alt={`Umini & Randeera — moment ${slideIndex + 1}`}
                fill
                priority={slideIndex === 0}
                sizes="(max-width: 640px) 100vw, 80vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradient wash so controls & dots stay legible over any photo */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ruby-dark/70 via-transparent to-ruby-dark/20" />

          {/* Prev / next controls */}
          <button
            onClick={prevSlide}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-ivory/90 backdrop-blur transition-colors hover:bg-black/50 sm:left-5"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-ivory/90 backdrop-blur transition-colors hover:bg-black/50 sm:right-5"
          >
            <ChevronRight size={22} />
          </button>

          {/* Play/pause */}
          <button
            onClick={() => setAutoPlay((p) => !p)}
            aria-label={autoPlay ? "Pause slideshow" : "Play slideshow"}
            className="absolute right-4 top-4 rounded-full bg-black/30 p-2 text-ivory/90 backdrop-blur transition-colors hover:bg-black/50"
          >
            {autoPlay ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {GALLERY_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIndex(idx)}
                aria-label={`Go to photo ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === slideIndex ? "w-6 bg-gold" : "w-1.5 bg-ivory/50 hover:bg-ivory/80"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Puzzle wall — a fixed 3×3 grid of tiles that individually flip
            to a new photo every couple of seconds, like puzzle pieces
            turning over, so all 17 photos surface over time without the
            page ever growing taller. Click any tile for the full lightbox. */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 sm:gap-5">
          {tilePhotos.map((photoIdx, tileIdx) => (
            <button
              key={tileIdx}
              onClick={() => setActiveIndex(photoIdx)}
              style={{ perspective: 1200 }}
              className="group relative aspect-square overflow-hidden rounded-xl card-shadow sm:rounded-2xl"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={tileKeys[tileIdx]}
                  initial={{ rotateY: 90, opacity: 0.4 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0.4 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={GALLERY_IMAGES[photoIdx]}
                    alt={`Umini & Randeera pre-wedding photo ${photoIdx + 1}`}
                    fill
                    sizes="(max-width: 640px) 33vw, 22vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.12]"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-ruby-dark/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl" />
              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gold/0 transition-all duration-300 group-hover:ring-gold/60 sm:rounded-2xl" />
            </button>
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
