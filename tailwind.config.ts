import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ruby: {
          DEFAULT: "#8B0000",
          dark: "#5C0000",
          light: "#A32638",
        },
        wine: "#800020",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8CE7A",
          dark: "#A6862A",
        },
        cream: "#FAFAFA",
        ivory: "#FDF8F3",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        sinhala: ["var(--font-sinhala)", "sans-serif"],
      },
      backgroundImage: {
        "ruby-gradient": "linear-gradient(135deg, #8B0000 0%, #800020 100%)",
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #E8CE7A 50%, #D4AF37 100%)",
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in-out forwards",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
