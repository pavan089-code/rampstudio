// src/components/Navbar.js

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/booking", label: "Book" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`
          fixed left-0 top-0 z-50 flex w-full items-center justify-between
          px-5 py-4 transition-all duration-500 sm:px-8 md:px-16 md:py-5
          ${
            scrolled
              ? "border-b border-white/10 bg-black/75 backdrop-blur-xl"
              : "bg-gradient-to-b from-black/45 to-transparent"
          }
        `}
      >
        <Link href="/" className="inline-flex min-h-11 items-center">
          <h1 className="text-[11px] font-light tracking-[0.34em] text-white sm:text-sm md:text-base">
            RAMP STUDIO
          </h1>
        </Link>

        <nav className="hidden gap-10 text-xs uppercase tracking-[0.18em] md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-underline text-muted transition duration-300 hover:text-[var(--accent-gold)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex min-h-12 min-w-12 flex-col items-end justify-center gap-2 text-white md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="h-px w-8 bg-current transition" />
          <span className="h-px w-5 bg-current transition" />
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex min-h-[100svh] flex-col bg-black/96 px-6 pb-8 pt-6 backdrop-blur-xl sm:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.34em] text-white/70">
                Ramp Studio
              </p>

              <button
                type="button"
                className="min-h-12 px-2 text-xs uppercase tracking-[0.22em] text-white transition hover:text-[var(--accent-gold)]"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                Close
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-7 text-left font-serif text-[clamp(3rem,16vw,5.5rem)] leading-[0.92]">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-white/10 pb-5 text-white transition duration-500 hover:text-[var(--accent-gold)]"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.18em] text-white/45">
              <span>Wedding Stories</span>
              <span className="text-right">India / Worldwide</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
