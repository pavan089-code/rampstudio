// src/app/layout.js

import "./globals.css";

import { Geist, Playfair_Display } from "next/font/google";

import SiteChrome from "@/components/SiteChrome";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-playfair",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata = {
  title: "Ramp Studio",
  description: "Luxury Wedding & Event Photography",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`
          ${geist.variable}
          ${playfair.variable}
          bg-primary
          font-sans
          text-white
          antialiased
        `}
      >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
