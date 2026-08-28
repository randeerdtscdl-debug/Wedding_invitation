"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function LanguageToggle() {
  const { t, toggleLanguage, isSinhala } = useLanguage();

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      aria-label={t.languageToggle.aria}
      className="fixed right-4 top-4 z-[200] flex items-center gap-2 rounded-full border border-gold/60 bg-ruby-dark/70 px-4 py-2 text-xs font-medium uppercase tracking-widest text-gold shadow-lg backdrop-blur-md transition-colors hover:bg-ruby-dark/90 sm:right-6 sm:top-6"
    >
      <Languages size={14} />
      <span className={isSinhala ? undefined : "font-sinhala"}>
        {t.languageToggle.label}
      </span>
    </motion.button>
  );
}
