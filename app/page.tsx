"use client";

import { useState } from "react";
import IntroOverlay from "@/components/IntroOverlay";
import AudioPlayer from "@/components/AudioPlayer";
import HeroSection from "@/components/HeroSection";
import DetailsSection from "@/components/DetailsSection";
import PoruwaTimeline from "@/components/PoruwaTimeline";
import MapSection from "@/components/MapSection";
import GallerySection from "@/components/GallerySection";
import RsvpForm from "@/components/RsvpForm";
import GuestWall from "@/components/GuestWall";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <main className="relative">
      <IntroOverlay onComplete={() => setIntroComplete(true)} />
      <AudioPlayer shouldPlay={introComplete} />

      {introComplete && (
        <>
          <HeroSection />
          <DetailsSection />
          <PoruwaTimeline />
          <MapSection />
          <GallerySection />
          <RsvpForm />
          <GuestWall />

          <footer className="bg-ruby-dark px-6 py-10 text-center">
            <p className="font-display text-lg italic text-gold">
              Umini &amp; Randeera
            </p>
            <p className="mt-2 font-sans text-xs uppercase tracking-[0.2em] text-ivory/50">
              22nd October 2026 · Made with love
            </p>
          </footer>
        </>
      )}
    </main>
  );
}
