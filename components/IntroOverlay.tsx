"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";

interface IntroOverlayProps {
  onComplete: () => void;
}

type Stage = "gate" | "cinematic" | "done";

/**
 * Fullscreen entry gate. Flow:
 *  1. "gate"      — romantic cover, waits for a user click (required for
 *                    autoplaying audio/video in every major browser).
 *  2. "cinematic" — short intro video plays once, then fades out.
 *  3. "done"      — overlay unmounts, parent starts background music.
 */
export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [stage, setStage] = useState<Stage>("gate");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleOpen = () => {
    setStage("cinematic");
    // Slight delay so the video element has mounted before we call play().
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {
        // If the intro video can't play for any reason, don't block the guest.
        finishIntro();
      });
    });
  };

  const finishIntro = () => {
    setStage("done");
    onComplete();
  };

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ruby-gradient overflow-hidden"
        >
          {stage === "gate" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="relative flex flex-col items-center gap-8 px-6 text-center"
            >
              {/* Ambient floating hearts */}
              <div className="pointer-events-none absolute inset-0 -z-10">
                {[...Array(12)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-gold/30"
                    style={{
                      left: `${(i * 37) % 100}%`,
                      top: `${(i * 53) % 100}%`,
                    }}
                    animate={{ y: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
                    transition={{
                      duration: 4 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <Heart size={16 + (i % 3) * 6} fill="currentColor" />
                  </motion.span>
                ))}
              </div>

              <p className="font-display text-lg tracking-[0.3em] text-gold uppercase">
                The Wedding Of
              </p>
              <h1 className="font-serif text-5xl sm:text-7xl text-ivory font-semibold leading-tight">
                Umini <span className="text-gold">&amp;</span> Randeera
              </h1>
              <p className="max-w-md font-display text-xl text-ivory/80 italic">
                are getting married
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpen}
                className="mt-6 rounded-full border border-gold bg-transparent px-10 py-3 font-sans text-sm uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ruby-dark"
              >
                Click to Open Invitation
              </motion.button>
            </motion.div>
          )}

          {stage === "cinematic" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
            >
              <video
                ref={videoRef}
                src="/video/intro-cinematic.mp4"
                muted={false}
                playsInline
                onEnded={finishIntro}
                onError={finishIntro}
                className="h-full w-full object-cover"
              />
              <button
                onClick={finishIntro}
                className="absolute bottom-8 right-8 rounded-full bg-black/40 px-5 py-2 font-sans text-xs uppercase tracking-widest text-ivory backdrop-blur hover:bg-black/60"
              >
                Skip Intro
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
