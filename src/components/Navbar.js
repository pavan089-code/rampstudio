// src/components/Navbar.js

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Navbar */}
      <header
        className={`
          fixed top-0 left-0 w-full z-50
          transition-all duration-500
          px-5 md:px-16 py-5
          flex justify-between items-center

          ${
            scrolled
              ? "bg-black/60 backdrop-blur-md border-b border-white/10"
              : "bg-transparent"
          }
        `}
      >

        {/* Logo */}
        <Link href="/">
          <h1 className="text-sm md:text-base tracking-[0.35em] text-white font-light cursor-pointer">
            RAMP STUDIO
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10 text-sm tracking-[0.15em]">

          <Link
            href="/portfolio"
            className="text-muted hover:text-[var(--accent-gold)] transition duration-300"
          >
            Portfolio
          </Link>

          <Link
            href="/booking"
            className="text-muted hover:text-[var(--accent-gold)] transition duration-300"
          >
            Book
          </Link>

          <Link
            href="/contact"
            className="text-muted hover:text-[var(--accent-gold)] transition duration-300"
          >
            Contact
          </Link>

        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 z-[100]
          bg-black
          flex flex-col items-center justify-center
          transition-all duration-500

          ${
            menuOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }
        `}
      >

        {/* Close Button */}
        <button
          className="absolute top-6 right-6 text-white text-3xl"
          onClick={() => setMenuOpen(false)}
        >
          ×
        </button>

        {/* Mobile Links */}
        <nav className="flex flex-col gap-10 text-3xl font-serif text-center">

          <Link
            href="/portfolio"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:text-[var(--accent-gold)] transition"
          >
            Portfolio
          </Link>

          <Link
            href="/booking"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:text-[var(--accent-gold)] transition"
          >
            Book
          </Link>

          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:text-[var(--accent-gold)] transition"
          >
            Contact
          </Link>

        </nav>

      </div>
    </>
  );
}