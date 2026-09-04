"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Users } from "lucide-react";
import { supabase, RSVP_TABLE } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

interface AttendingGuest {
  id: string;
  full_name: string;
  photo_url: string | null;
}

/**
 * Public-facing wall. Deliberately selects ONLY id, full_name, photo_url —
 * never contact info, guest_count, or messages — so this component cannot
 * leak private RSVP data even if its rendering logic changes later.
 *
 * `full_name` is still fetched (used only as the image `alt` text for
 * accessibility/screen readers) but is never rendered as visible text —
 * the wall is a pure photo mosaic.
 */
export default function GuestWall() {
  const [guests, setGuests] = useState<AttendingGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, isSinhala } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    const fetchGuests = async () => {
      const { data, error } = await supabase
        .from(RSVP_TABLE)
        .select("id, full_name, photo_url")
        .eq("attendance_status", "attending")
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (!error && data) {
        setGuests(data as AttendingGuest[]);
      }
      setLoading(false);
    };

    fetchGuests();

    // Live updates: new RSVPs appear on the wall without a page refresh.
    const channel = supabase
      .channel("rsvp-guest-wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: RSVP_TABLE },
        (payload) => {
          const row = payload.new as {
            id: string;
            full_name: string;
            photo_url: string | null;
            attendance_status: string;
          };
          if (row.attendance_status === "attending") {
            setGuests((prev) => [
              { id: row.id, full_name: row.full_name, photo_url: row.photo_url },
              ...prev,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Guests without a photo don't get a slot on the wall — this is a photo
  // mosaic, so a placeholder tile would look like an error rather than a
  // guest. They're still fully saved in the RSVP table either way.
  const guestsWithPhotos = guests.filter((g) => g.photo_url);

  // A rotation of distinct entrance animations — fade+rise, slide from the
  // left, slide from the right, a gentle spin-in, a pop — so neighbouring
  // photos don't all move in lockstep.
  const TILE_VARIANTS: Variants[] = [
    {
      hidden: { opacity: 0, y: 40, scale: 0.9 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    {
      hidden: { opacity: 0, x: -50, rotate: -6 },
      visible: { opacity: 1, x: 0, rotate: 0 },
    },
    {
      hidden: { opacity: 0, x: 50, rotate: 6 },
      visible: { opacity: 1, x: 0, rotate: 0 },
    },
    {
      hidden: { opacity: 0, scale: 0.6, rotate: -10 },
      visible: { opacity: 1, scale: 1, rotate: 0 },
    },
    {
      hidden: { opacity: 0, y: -30, scale: 0.85 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
  ];

  return (
    <section id="guest-wall" className="bg-cream px-6 py-24 sm:py-32">
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
            {t.guestWall.joining}
          </p>
          <h2
            className={`mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.guestWall.heading}
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
        </motion.div>

        {loading ? (
          <p
            className={`mt-14 text-center font-sans text-sm text-[#4A2020]/60 ${
              isSinhala ? "font-sinhala" : ""
            }`}
          >
            {t.guestWall.loading}
          </p>
        ) : guestsWithPhotos.length === 0 ? (
          <div className="mt-14 flex flex-col items-center gap-3 text-center">
            <Users size={28} className="text-gold" />
            <p
              className={`font-sans text-sm text-[#4A2020]/60 ${
                isSinhala ? "font-sinhala" : ""
              }`}
            >
              {t.guestWall.empty}
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-10 md:grid-cols-5">
            {guestsWithPhotos.map((guest, idx) => {
              const variant = TILE_VARIANTS[idx % TILE_VARIANTS.length];

              return (
                <motion.div
                  key={guest.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  variants={variant}
                  transition={{
                    type: "spring",
                    stiffness: 110,
                    damping: 14,
                    delay: (idx % 10) * 0.06,
                  }}
                  whileHover={{ scale: 1.06 }}
                  className="group mx-auto"
                >
                  {/* Circular locket frame — fixed size so every guest
                      photo, portrait or landscape, reads as the same
                      neat round portrait. A soft gold ring + faint outer
                      halo gives it a framed, keepsake feel rather than a
                      plain grid tile. */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28">
                    <div className="absolute inset-0 rounded-full bg-gold/20 blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                    <div className="relative h-full w-full overflow-hidden rounded-full ring-4 ring-gold/50 ring-offset-2 ring-offset-cream shadow-lg transition-all duration-300 group-hover:ring-gold group-hover:shadow-2xl">
                      <Image
                        src={guest.photo_url as string}
                        alt={guest.full_name}
                        fill
                        sizes="(min-width: 768px) 112px, 80px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Subtle ruby wash on hover so every portrait reads
                          as part of the same wedding theme. */}
                      <div className="absolute inset-0 rounded-full bg-ruby-dark/0 transition-colors duration-300 group-hover:bg-ruby-dark/10" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
