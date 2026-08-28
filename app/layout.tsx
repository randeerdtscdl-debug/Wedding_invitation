import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sinhala",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Umini & Randeera | We're Getting Married",
  description:
    "Join Umini & Randeera as they begin their journey together on Thursday, 22nd October 2026 at Monarch Imperial, Sri Jayawardenepura Kotte.",
  openGraph: {
    title: "Umini & Randeera | We're Getting Married",
    description:
      "Thursday, 22nd October 2026 — Monarch Imperial, Sri Jayawardenepura Kotte, Sri Lanka.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${cormorant.variable} ${inter.variable} ${notoSinhala.variable} font-sans bg-cream text-[#2B1010] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
