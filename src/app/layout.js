// src/app/layout.js

import "./globals.css";

import { Geist, Playfair_Display } from "next/font/google";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import WhatsAppButton from "@/components/WhatsappButton";
import Loader from "@/components/Loader";
import CinematicGrain from "@/components/CinematicGrains";

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
        <Loader />
        <CinematicGrain />
        <PageTransition>
        <WhatsAppButton />
        <Navbar />
        <PageTransition>{children}</PageTransition>
        
        <Footer />
        </PageTransition>
      </body>
    </html>
  );
}
