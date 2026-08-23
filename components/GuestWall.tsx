"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Users } from "lucide-react";
import { supabase, RSVP_TABLE } from "@/lib/supabaseClient";

interface AttendingGuest {
  id: string;
  full_name: string;
  photo_url: string | null;
}

/**
 * Public-facing wall. Deliberately selects ONLY id, full_name, photo_url —
 * never contact info, guest_count, or messages — so this component cannot
 * leak private RSVP data even if its rendering logic changes later.
 */
export default function GuestWall() {
  const [guests, setGuests] = useState<AttendingGuest[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section id="guest-wall" className="bg-cream px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="font-display text-lg uppercase tracking-[0.3em] text-gold-dark">
            Joining The Celebration
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ruby">
            Our Guests
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
        </motion.div>

        {loading ? (
          <p className="mt-14 text-center font-sans text-sm text-[#4A2020]/60">
            Loading well-wishers...
          </p>
        ) : guests.length === 0 ? (
          <p className="mt-14 text-center font-sans text-sm text-[#4A2020]/60">
            Be the first to RSVP and appear here!
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {guests.map((guest, idx) => (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 15,
                  delay: (idx % 4) * 0.08,
                }}
                whileHover={{ y: -5 }}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-ivory p-5 card-shadow transition-shadow duration-300 hover:shadow-xl"
              >
                {/* Fixed-size square frame — every guest photo, whatever its
                    original dimensions, is cropped to fill this frame so the
                    grid always stays perfectly aligned. */}
                <div className="relative aspect-square w-full max-w-[120px] overflow-hidden rounded-full ring-4 ring-gold/40 transition-all duration-300 group-hover:ring-gold">
                  {guest.photo_url ? (
                    <Image
                      src={guest.photo_url}
                      alt={guest.full_name}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-ruby-gradient text-gold">
                      <Users size={28} />
                    </div>
                  )}
                </div>
                <p className="text-center font-sans text-xs font-medium text-[#2B1010] line-clamp-2">
                  {guest.full_name}
                </p>
                <Heart size={12} className="text-gold" fill="currentColor" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
