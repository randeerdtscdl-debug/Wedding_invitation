"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Heart,
  Sparkles,
} from "lucide-react";
import type { AttendanceStatus, MemoryRelatedTo } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

type SubmitState = "idle" | "submitting" | "success" | "error";
type MemoryState = "idle" | "submitting" | "success" | "error";

export default function RsvpForm() {
  const { t, isSinhala } = useLanguage();
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

  // --- Inline "Add Your Memories" mini-form, shown right after a
  // successful RSVP so guests can immediately share a photo + message
  // that appears on the public Memories wall. ---
  const [memoryRelated, setMemoryRelated] = useState<MemoryRelatedTo>("couple");
  const [memoryComment, setMemoryComment] = useState("");
  const [memoryPhoto, setMemoryPhoto] = useState<File | null>(null);
  const [memoryPreview, setMemoryPreview] = useState<string | null>(null);
  const [memoryState, setMemoryState] = useState<MemoryState>("idle");
  const [memoryError, setMemoryError] = useState("");

  const label = isSinhala ? "font-sinhala" : "uppercase tracking-widest";
  const labelWide = isSinhala ? "font-sinhala" : "uppercase tracking-[0.3em]";
  const body = isSinhala ? "font-sinhala" : "";

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(t.rsvp.errorPhotoSize);
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

    // Name, email, and phone are always required; a photo is required too
    // so every RSVP can appear on the Guest Wall.
    if (!fullName.trim() || !email.trim() || !phone.trim() || !photo) {
      setErrorMsg(t.rsvp.errorRequiredFields);
      return;
    }
    if (!emailPattern.test(email.trim())) {
      setErrorMsg(t.rsvp.errorEmailInvalid);
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
      formData.append("photo", photo);

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

  // --- Memory mini-form handlers ---
  const handleMemoryPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMemoryError(t.memories.errorPhotoSize);
      return;
    }
    setMemoryPhoto(file);
    setMemoryPreview(URL.createObjectURL(file));
    setMemoryError("");
  };

  const resetMemoryForm = () => {
    setMemoryRelated("couple");
    setMemoryComment("");
    setMemoryPhoto(null);
    setMemoryPreview(null);
  };

  const handleMemorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!memoryComment.trim() || !memoryPhoto) {
      setMemoryError(t.memories.errorRequired);
      return;
    }
    setMemoryState("submitting");
    setMemoryError("");

    try {
      const formData = new FormData();
      formData.append("guest_name", submittedName);
      formData.append("related_to", memoryRelated);
      formData.append("comment", memoryComment.trim());
      formData.append("photo", memoryPhoto);

      const res = await fetch("/api/memories", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setMemoryState("success");
      resetMemoryForm();
    } catch (err) {
      setMemoryState("error");
      setMemoryError(err instanceof Error ? err.message : "Unexpected error.");
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
          <p className={`font-display text-lg text-gold ${labelWide}`}>
            {t.rsvp.kindlyRespond}
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold text-ivory">
            {t.rsvp.heading}
          </h2>
          <p className={`mt-3 font-sans text-sm text-ivory/70 ${body}`}>
            {t.rsvp.respondBy}
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
            <h3 className={`font-serif text-2xl text-ivory ${body}`}>
              {t.rsvp.thankYou}
            </h3>
            <p className={`font-sans text-sm text-ivory/80 ${body}`}>
              {t.rsvp.received}
            </p>

            {submittedName && (
              <a
                href={`/api/invitation?name=${encodeURIComponent(submittedName)}`}
                download
                className={`mt-2 flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3 text-sm font-semibold text-ruby-dark shadow-lg transition-transform hover:scale-105 ${label}`}
              >
                <Download size={18} /> {t.rsvp.downloadInvitation}
              </a>
            )}

            <button
              onClick={() => setState("idle")}
              className={`mt-2 rounded-full border border-gold px-6 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ruby-dark ${body}`}
            >
              {t.rsvp.submitAnother}
            </button>
          </motion.div>
        ) : null}

        {/* Inline "Add Your Memories" mini-form — shown right after a
            successful RSVP so the moment is fresh. Fully separate submit
            flow from the RSVP itself: this posts to /api/memories and
            feeds the public Memories wall further down the page. */}
        {state === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-8 rounded-3xl border border-gold/20 bg-ivory/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
          >
            <AnimatePresence mode="wait">
              {memoryState === "success" ? (
                <motion.div
                  key="memory-success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 170, damping: 18 }}
                  className="flex flex-col items-center gap-3 py-4 text-center"
                >
                  <Sparkles size={36} className="text-gold" />
                  <h4 className={`font-serif text-xl text-ivory ${body}`}>
                    {t.memories.thankYou}
                  </h4>
                  <p className={`font-sans text-sm text-ivory/80 ${body}`}>
                    {t.memories.received}
                  </p>
                  <button
                    onClick={() => setMemoryState("idle")}
                    className={`mt-2 rounded-full border border-gold px-6 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ruby-dark ${body}`}
                  >
                    {t.memories.addAnother}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="memory-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleMemorySubmit}
                  className="space-y-5"
                >
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Heart size={26} className="text-gold" />
                    <p className={`font-display text-base text-gold ${labelWide}`}>
                      {t.memories.label}
                    </p>
                    <h4 className={`font-serif text-2xl font-semibold text-ivory ${body}`}>
                      {t.memories.heading}
                    </h4>
                    <p className={`mt-1 max-w-md font-sans text-xs text-ivory/70 ${body}`}>
                      {t.memories.subheading}
                    </p>
                  </div>

                  <div>
                    <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                      {t.memories.relatedTo}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { value: "couple", label: t.memories.couple },
                          { value: "bride", label: t.memories.bride },
                          { value: "groom", label: t.memories.groom },
                        ] as const
                      ).map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setMemoryRelated(opt.value)}
                          className={`rounded-xl border px-3 py-2.5 font-sans text-xs transition-all ${body} ${
                            memoryRelated === opt.value
                              ? "border-gold bg-gold-gradient font-semibold text-ruby-dark shadow-md scale-[1.02]"
                              : "border-gold/30 bg-ivory/10 text-ivory hover:bg-ivory/20"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                      {t.memories.comment}
                    </label>
                    <div className="relative">
                      <MessageSquareHeart
                        size={17}
                        className="pointer-events-none absolute left-4 top-3.5 text-ruby/50"
                      />
                      <textarea
                        rows={3}
                        required
                        value={memoryComment}
                        onChange={(e) => setMemoryComment(e.target.value)}
                        className={`w-full resize-none rounded-xl border border-gold/30 bg-ivory/95 py-3 pl-11 pr-4 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30 ${body}`}
                        placeholder={t.memories.commentPlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                      {t.memories.uploadPhoto}
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gold/40 bg-ivory/5 px-4 py-4 text-ivory/80 transition-colors hover:border-gold hover:bg-ivory/10">
                      <ImagePlus size={20} className="text-gold" />
                      <span className={`font-sans text-sm ${body}`}>
                        {memoryPhoto ? memoryPhoto.name : t.memories.choosePhoto}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMemoryPhotoChange}
                        className="hidden"
                      />
                    </label>
                    {memoryPreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={memoryPreview}
                        alt="Memory preview"
                        className="mt-3 h-28 w-28 rounded-xl object-cover shadow-md ring-2 ring-gold/40"
                      />
                    )}
                  </div>

                  {memoryError && (
                    <div className={`flex items-center gap-2 rounded-xl bg-red-900/30 px-4 py-3 text-sm text-red-200 ${body}`}>
                      <XCircle size={16} />
                      {memoryError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={memoryState === "submitting"}
                    className={`flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-8 py-3.5 font-sans text-sm font-semibold text-ruby-dark transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 ${label}`}
                  >
                    {memoryState === "submitting" ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> {t.memories.submitting}
                      </>
                    ) : (
                      t.memories.submit
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {state !== "success" && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            onSubmit={handleSubmit}
            className="mt-12 space-y-6 rounded-3xl border border-gold/20 bg-ivory/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
          >
            <div>
              <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                {t.rsvp.fullName}
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
                  className={`w-full rounded-xl border border-gold/30 bg-ivory/95 py-3 pl-11 pr-4 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30 ${body}`}
                  placeholder={t.rsvp.fullNamePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                {t.rsvp.willAttend}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "attending", label: t.rsvp.attending },
                    { value: "declining", label: t.rsvp.declining },
                  ] as const
                ).map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setAttendance(opt.value)}
                    className={`rounded-xl border px-4 py-3 font-sans text-sm transition-all ${body} ${
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
                <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                  {t.rsvp.guestCount}
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
              <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                {t.rsvp.email}
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
                  placeholder={t.rsvp.emailPlaceholder}
                />
              </div>
              <p className={`mt-1.5 font-sans text-xs text-ivory/60 ${body}`}>
                {t.rsvp.emailNote}
              </p>
            </div>

            <div>
              <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                {t.rsvp.phone}
              </label>
              <div className="relative">
                <PhoneIcon
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ruby/50"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gold/30 bg-ivory/95 py-3 pl-11 pr-4 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30"
                  placeholder={t.rsvp.phonePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                {t.rsvp.message}
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
                  className={`w-full resize-none rounded-xl border border-gold/30 bg-ivory/95 py-3 pl-11 pr-4 font-sans text-sm text-[#2B1010] shadow-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30 ${body}`}
                  placeholder={t.rsvp.messagePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className={`mb-1.5 block font-sans text-xs font-semibold text-gold ${label}`}>
                {t.rsvp.uploadPhoto}
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gold/40 bg-ivory/5 px-4 py-4 text-ivory/80 transition-colors hover:border-gold hover:bg-ivory/10">
                <ImagePlus size={20} className="text-gold" />
                <span className={`font-sans text-sm ${body}`}>
                  {photo ? photo.name : t.rsvp.choosePhoto}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className={`mt-1.5 font-sans text-xs text-ivory/60 ${body}`}>
                {t.rsvp.photoRequiredNote}
              </p>
              {photoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mt-3 h-28 w-28 rounded-xl object-cover shadow-md ring-2 ring-gold/40"
                />
              )}
            </div>

            {errorMsg && (
              <div className={`flex items-center gap-2 rounded-xl bg-red-900/30 px-4 py-3 text-sm text-red-200 ${body}`}>
                <XCircle size={16} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={state === "submitting"}
              className={`flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-8 py-3.5 font-sans text-sm font-semibold text-ruby-dark transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 ${label}`}
            >
              {state === "submitting" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> {t.rsvp.submitting}
                </>
              ) : (
                t.rsvp.send
              )}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
