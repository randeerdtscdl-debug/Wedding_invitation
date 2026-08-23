"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ImagePlus,
  User,
  Mail,
  Phone as PhoneIcon,
  MessageSquareHeart,
  Download,
} from "lucide-react";
import type { AttendanceStatus } from "@/lib/supabaseClient";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function RsvpForm() {
  const [fullName, setFullName] = useState("");
  const [attendance, setAttendance] = useState<AttendanceStatus>("attending");
  const [guestCount, setGuestCount] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Photo must be smaller than 5MB.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrorMsg("");
  };

  const resetForm = () => {
    setFullName("");
    setAttendance("attending");
    setGuestCount(1);
    setEmail("");
    setPhone("");
    setMessage("");
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg("Please fill in your name and email address.");
      return;
    }
    if (!emailPattern.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setState("submitting");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("attendance_status", attendance);
      formData.append("guest_count", String(guestCount));
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("message", message.trim());
      if (attendance === "attending" && photo) {
        formData.append("photo", photo);
      }

      const res = await fetch("/api/rsvp", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setSubmittedName(fullName.trim());
      setState("success");
      resetForm();
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  return (
    <section id="rsvp" className="bg-ruby-gradient px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="font-display text-lg uppercase tracking-[0.3em] text-gold">
            Kindly Respond
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ivory">
            RSVP
          </h2>
          <p className="mt-3 font-sans text-sm text-ivory/70">
            Please respond by 10th October 2026
          </p>
        </motion.div>

        {state === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-ivory/10 p-10 text-center backdrop-blur"
          >
            <CheckCircle2 size={48} className="text-gold" />
            <h3 className="font-serif text-2xl text-ivory">Thank You!</h3>
            <p className="font-sans text-sm text-ivory/80">
              Your RSVP has been received. A confirmation with the wedding
              details is on its way to your email.
            </p>

            {submittedName && (
              <a
                href={`/api/invitation?name=${encodeURIComponent(submittedName)}`}
                download
                className="mt-2 flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3 text-sm font-semibold uppercase tracking-widest text-ruby-dark shadow-lg transition-transform hover:scale-105"
              >
                <Download size={18} /> Download Your Invitation
              </a>
            )}

            <button
              onClick={() => setState("idle")}
              className="mt-2 rounded-full border border-gold px-6 py-2 text-sm text-gold hover:bg-gold hover:text-ruby-dark transition-colors"
            >
              Submit Another Response
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            onSubmit={handleSubmit}
            className="mt-12 space-y-6 rounded-3xl border border-gold/20 bg-ivory/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
          >
            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ruby/50"
                />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gold/30 bg-ivory/95 py-3 pl-11 pr-4 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                Will You Be Attending?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "attending", label: "Joyfully Attending" },
                    { value: "declining", label: "Regretfully Declining" },
                  ] as const
                ).map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setAttendance(opt.value)}
                    className={`rounded-xl border px-4 py-3 font-sans text-sm transition-all ${
                      attendance === opt.value
                        ? "border-gold bg-gold-gradient font-semibold text-ruby-dark shadow-md scale-[1.02]"
                        : "border-gold/30 bg-ivory/10 text-ivory hover:bg-ivory/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {attendance === "attending" && (
              <div>
                <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                  Number of Guests Attending
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-gold/30 bg-ivory/95 px-4 py-3 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ruby/50"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gold/30 bg-ivory/95 py-3 pl-11 pr-4 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30"
                  placeholder="you@example.com"
                />
              </div>
              <p className="mt-1.5 font-sans text-xs text-ivory/60">
                We&apos;ll send your RSVP confirmation and wedding details here.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                Mobile Number
              </label>
              <div className="relative">
                <PhoneIcon
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ruby/50"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gold/30 bg-ivory/95 py-3 pl-11 pr-4 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30"
                  placeholder="07X XXX XXXX"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                Message / Wishes For The Couple
              </label>
              <div className="relative">
                <MessageSquareHeart
                  size={17}
                  className="pointer-events-none absolute left-4 top-3.5 text-ruby/50"
                />
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none rounded-xl border border-gold/30 bg-ivory/95 py-3 pl-11 pr-4 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30"
                  placeholder="Share your wishes..."
                />
              </div>
            </div>

            {attendance === "attending" && (
              <div>
                <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                  Upload Your Photo
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gold/40 bg-ivory/5 px-4 py-4 text-ivory/80 transition-colors hover:border-gold hover:bg-ivory/10">
                  <ImagePlus size={20} className="text-gold" />
                  <span className="font-sans text-sm">
                    {photo ? photo.name : "Choose an image (max 5MB)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="mt-3 h-28 w-28 rounded-xl object-cover shadow-md ring-2 ring-gold/40"
                  />
                )}
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-900/30 px-4 py-3 text-sm text-red-200">
                <XCircle size={16} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={state === "submitting"}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-8 py-3.5 font-sans text-sm font-semibold uppercase tracking-widest text-ruby-dark transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {state === "submitting" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                "Send RSVP"
              )}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
