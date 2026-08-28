"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
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

    // Live updates: newly submitted memories slide in without a page refresh.
    const channel = supabase
      .channel("memories-wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: MEMORIES_TABLE },
        (payload) => {
          const row = payload.new as Memory;
          setMemories((prev) => [row, ...prev]);
          setIndex(0);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
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
    if (!autoPlay || memories.length < 2) return;
    const timer = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [autoPlay, memories.length, next]);

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
            className="relative mx-auto mt-14 overflow-hidden rounded-[2rem] bg-ruby-dark card-shadow"
          >
            <div className="relative aspect-[4/5] w-full sm:aspect-[16/9]">
              <AnimatePresence mode="sync">
                {current && (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={current.photo_url}
                      alt={current.comment}
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover"
                    />
                    {/* Overlay so the comment text always reads clearly,
                        regardless of the guest's photo. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ruby-dark via-ruby-dark/20 to-transparent" />

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 sm:p-10"
                    >
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
                        className={`max-w-2xl font-display text-lg italic text-ivory sm:text-xl ${
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
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {memories.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous memory"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-ivory/90 backdrop-blur transition-colors hover:bg-black/50 sm:left-5"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={next}
                  aria-label="Next memory"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-ivory/90 backdrop-blur transition-colors hover:bg-black/50 sm:right-5"
                >
                  <ChevronRight size={22} />
                </button>

                <div className="absolute right-4 top-4 flex gap-1.5">
                  {memories.slice(0, 12).map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setIndex(idx)}
                      aria-label={`Go to memory ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === index ? "w-6 bg-gold" : "w-1.5 bg-ivory/50 hover:bg-ivory/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
