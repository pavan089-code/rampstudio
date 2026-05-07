// src/app/layout.js

import "./globals.css";

import { Playfair_Display } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata = {
  title: "Ramp Studio",
  description: "Luxury Wedding & Event Photography",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`
          ${playfair.className}
          bg-primary
          text-white
          antialiased
        `}
      >

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        {children}

        {/* Footer */}
        <Footer />

      </body>
    </html>
  );
}