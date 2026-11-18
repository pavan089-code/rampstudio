// src/app/layout.js

import "./globals.css";

import localFont from "next/font/local";

import SiteChrome from "@/components/SiteChrome";

const playfair = localFont({
  src: "./fonts/PlayfairDisplay-Variable.ttf",
  weight: "400 900",
  style: "normal",
  variable: "--font-playfair",
  display: "swap",
});

const geist = localFont({
  src: "./fonts/Geist-Variable.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--font-geist-sans",
  display: "swap",
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
