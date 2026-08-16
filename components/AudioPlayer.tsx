"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  /** Set true once the intro gate has been dismissed so we can autoplay. */
  shouldPlay: boolean;
  src?: string;
}

/**
 * Fixed-position mute/unmute toggle. Because browsers block unprompted
 * autoplay-with-sound, playback only ever starts in response to the user's
 * "Open Invitation" click (see IntroOverlay), which satisfies the browser's
 * user-gesture requirement.
 */
export default function AudioPlayer({
  shouldPlay,
  src = "/audio/wedding-theme.mp3",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (shouldPlay && audioRef.current) {
      audioRef.current.volume = 0.55;
      audioRef.current
        .play()
        .then(() => setReady(true))
        .catch(() => {
          // Autoplay was blocked despite the gesture (rare, e.g. iOS quirks).
          // The user can still tap the toggle button to start playback.
          setReady(false);
        });
    }
  }, [shouldPlay]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (!ready) {
      audioRef.current
        .play()
        .then(() => setReady(true))
        .catch(() => {});
      return;
    }
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(audioRef.current.muted);
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: shouldPlay ? 1 : 0, scale: shouldPlay ? 1 : 0.6 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        onClick={toggleMute}
        aria-label={muted ? "Unmute background music" : "Mute background music"}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-ruby-gradient text-gold shadow-lg card-shadow ring-1 ring-gold/40 hover:scale-110 transition-transform"
      >
        <motion.span
          animate={{ rotate: muted ? 0 : [0, 5, -5, 0] }}
          transition={{ repeat: muted ? 0 : Infinity, duration: 2.5 }}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </motion.span>
      </motion.button>
    </>
  );
}
