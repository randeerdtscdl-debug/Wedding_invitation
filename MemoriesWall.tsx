"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { supabase, MEMORIES_TABLE } from "@/lib/supabaseClient";
import type { MemoryRelatedTo } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

interface Memory {
  id: string;
  guest_name: string | null;
  related_to: MemoryRelatedTo;
  comment: string;
  photo_url: string;
  created_at: string;
}

const SLIDE_DURATION = 6000;

export default function MemoriesWall() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const { t, isSinhala } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from(MEMORIES_TABLE)
        .select("id, guest_name, related_to, comment, photo_url, created_at")
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (!error && data) {
        setMemories(data as Memory[]);
      }
      setLoading(false);
    };

    fetchMemories();

    // Live updates from OTHER guests/devices: newly submitted memories slide
    // in without a page refresh. (For the guest who just submitted on this
    // same page, the "memory:added" event below fires instantly and doesn't
    // wait on this subscription — see the dedupe check in both handlers.)
    const channel = supabase
      .channel("memories-wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: MEMORIES_TABLE },
        (payload) => {
          const row = payload.new as Memory;
          setMemories((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [row, ...prev]
          );
          setIndex(0);
        }
      )
      .subscribe();

    // Instant update for the guest who just submitted, on this same page —
    // dispatched by RsvpForm right after a successful /api/memories call.
    // This doesn't depend on Supabase Realtime being enabled/configured
    // correctly, so the submitter always sees their memory appear right
    // away regardless.
    const handleLocalMemory = (e: Event) => {
      const detail = (e as CustomEvent<Memory>).detail;
      if (!detail) return;
      setMemories((prev) =>
        prev.some((m) => m.id === detail.id) ? prev : [detail, ...prev]
      );
      setIndex(0);
    };
    window.addEventListener("memory:added", handleLocalMemory);

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      window.removeEventListener("memory:added", handleLocalMemory);
    };
  }, []);

  const next = useCallback(() => {
    setIndex((prev) => (memories.length ? (prev + 1) % memories.length : 0));
  }, [memories.length]);

  const prev = useCallback(() => {
    setIndex((prev) =>
      memories.length ? (prev - 1 + memories.length) % memories.length : 0
    );
  }, [memories.length]);

  useEffect(() => {
    if (!autoPlay || modalOpen || memories.length < 2) return;
    const timer = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [autoPlay, modalOpen, memories.length, next]);

  // ---- Full-screen memory viewer (opens on tap) ----
  // Uses a history entry so the phone's Back button closes the viewer
  // instead of leaving the whole page.
  const openModal = useCallback(() => {
    if (swiped.current) return; // it was a swipe, not a tap
    window.history.pushState(
      { ...(window.history.state || {}), memoryModal: true },
      "",
      window.location.href
    );
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (window.history.state?.memoryModal) {
      window.history.back(); // popstate handler below closes it
    } else {
      setModalOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    const onPopState = () => setModalOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // stop page scrolling behind it

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalOpen, closeModal, next, prev]);

  // Swipe left/right to change memory (card + viewer)
  const onTouchStart = (e: React.TouchEvent) => {
    swiped.current = false;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      dx < 0 ? next() : prev();
      setTimeout(() => (swiped.current = false), 350);
    }
  };

  const relatedLabel = (rel: MemoryRelatedTo) => {
    if (rel === "bride") return t.memories.bride;
    if (rel === "groom") return t.memories.groom;
    return t.memories.couple;
  };

  const current = memories[index];

  return (
    <section id="memories" className="bg-ivory px-6 py-24 sm:py-32">
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
            {t.memories.wallLabel}
          </p>
          <h2
            className={`mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.memories.wallHeading}
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
        </motion.div>

        {loading ? (
          <p
            className={`mt-14 text-center font-sans text-sm text-[#4A2020]/60 ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.memories.wallLoading}
          </p>
        ) : memories.length === 0 ? (
          <div className="mt-14 flex flex-col items-center gap-3 text-center">
            <ImageOff size={28} className="text-gold" />
            <p
              className={`max-w-sm font-sans text-sm text-[#4A2020]/60 ${
                isSinhala ? "font-sinhala" : ""
              }`}
            >
              {t.memories.wallEmpty}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="relative mx-auto mt-14 overflow-hidden rounded-[2rem] bg-ruby-dark card-shadow"
          >
            {/* Tappable area: opens the full-screen viewer */}
            <div
              role="button"
              tabIndex={0}
              aria-label={t.memories.tapToView}
              onClick={openModal}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openModal();
                }
              }}
              className="relative block cursor-pointer text-left"
            >
              {/* PHOTO — shown whole (contain) over a blurred copy of itself,
                  so portrait phone photos are never cropped. */}
              <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">
                <AnimatePresence mode="sync">
                  {current && (
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={current.photo_url}
                        alt=""
                        aria-hidden
                        fill
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="scale-110 object-cover opacity-60 blur-2xl"
                      />
                      <Image
                        src={current.photo_url}
                        alt={current.comment}
                        fill
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="object-contain"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-ruby-dark/95 to-transparent sm:block" />
              </div>

              {/* CAPTION — below the photo on phones (never covers it),
                  overlaid at the bottom on larger screens. */}
              {current && (
                <div className="flex min-h-[9.5rem] flex-col gap-2 bg-ruby-dark p-5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:min-h-0 sm:bg-transparent sm:p-10">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-gold" fill="currentColor" />
                    <span
                      className={`font-sans text-[11px] text-gold ${
                        isSinhala ? "font-sinhala" : "uppercase tracking-[0.25em]"
                      }`}
                    >
                      {relatedLabel(current.related_to)}
                    </span>
                  </div>
                  <p
                    className={`line-clamp-3 max-w-2xl break-words font-display text-lg italic text-ivory sm:text-xl ${
                      isSinhala ? "font-sinhala not-italic" : ""
                    }`}
                  >
                    &ldquo;{current.comment}&rdquo;
                  </p>
                  {current.guest_name && (
                    <p
                      className={`font-sans text-xs text-ivory/70 ${
                        isSinhala ? "font-sinhala" : "uppercase tracking-widest"
                      }`}
                    >
                      — {current.guest_name}
                    </p>
                  )}
                  <p
                    className={`mt-auto font-sans text-[11px] text-gold/80 ${
                      isSinhala ? "font-sinhala" : "tracking-wide"
                    }`}
                  >
                    {t.memories.tapToView}
                  </p>
                </div>
              )}
            </div>

            {memories.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label={t.memories.previous}
                  className="absolute left-3 top-[calc(50%-2.5rem)] -translate-y-1/2 rounded-full bg-black/30 p-2 text-ivory/90 backdrop-blur transition-colors hover:bg-black/50 sm:left-5 sm:top-1/2"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={next}
                  aria-label={t.memories.next}
                  className="absolute right-3 top-[calc(50%-2.5rem)] -translate-y-1/2 rounded-full bg-black/30 p-2 text-ivory/90 backdrop-blur transition-colors hover:bg-black/50 sm:right-5 sm:top-1/2"
                >
                  <ChevronRight size={22} />
                </button>

                <div className="pointer-events-none absolute right-4 top-4 flex gap-1.5">
                  {memories.slice(0, 12).map((m, idx) => (
                    <span
                      key={m.id}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === index ? "w-6 bg-gold" : "w-1.5 bg-ivory/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* FULL-SCREEN VIEWER */}
      {modalOpen && current && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex flex-col bg-black/95"
            style={{ height: "100dvh" }}
            role="dialog"
            aria-modal="true"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Top bar with close */}
            <div
              className="flex items-center justify-between px-4 pb-2"
              style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
            >
              <span className="font-sans text-xs text-ivory/60">
                {index + 1} / {memories.length}
              </span>
              <button
                onClick={closeModal}
                aria-label={t.memories.close}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-ivory backdrop-blur transition-colors hover:bg-white/20"
              >
                <X size={20} />
                <span className={`text-xs ${isSinhala ? "font-sinhala" : "font-sans"}`}>
                  {t.memories.close}
                </span>
              </button>
            </div>

            {/* Photo (whole, never cropped). Tapping empty space closes. */}
            <div className="relative min-h-0 flex-1" onClick={closeModal}>
              <Image
                key={current.id}
                src={current.photo_url}
                alt={current.comment}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
              {memories.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    aria-label={t.memories.previous}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-ivory backdrop-blur"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    aria-label={t.memories.next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-ivory backdrop-blur"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Full message — scrolls if long */}
            <div
              className="max-h-[40%] overflow-y-auto bg-ruby-dark px-5 pt-4"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Heart size={14} className="text-gold" fill="currentColor" />
                <span
                  className={`font-sans text-[11px] text-gold ${
                    isSinhala ? "font-sinhala" : "uppercase tracking-[0.25em]"
                  }`}
                >
                  {relatedLabel(current.related_to)}
                </span>
              </div>
              <p
                className={`whitespace-pre-line break-words font-display text-lg italic text-ivory ${
                  isSinhala ? "font-sinhala not-italic" : ""
                }`}
              >
                &ldquo;{current.comment}&rdquo;
              </p>
              {current.guest_name && (
                <p
                  className={`mt-3 font-sans text-xs text-ivory/70 ${
                    isSinhala ? "font-sinhala" : "uppercase tracking-widest"
                  }`}
                >
                  — {current.guest_name}
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
