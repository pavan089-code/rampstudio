"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export default function GalleryLightbox({
  images,
  activeIndex,
  onClose,
  onSelect,
}) {
  const [touchStart, setTouchStart] = useState(null);
  const isOpen = activeIndex !== null;
  const activeImage = isOpen ? images[activeIndex] : null;

  const goTo = useMemo(
    () => ({
      next: () => onSelect((activeIndex + 1) % images.length),
      previous: () =>
        onSelect((activeIndex - 1 + images.length) % images.length),
    }),
    [activeIndex, images.length, onSelect]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goTo.next();
      if (event.key === "ArrowLeft") goTo.previous();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goTo, isOpen, onClose]);

  const handleTouchEnd = (event) => {
    if (touchStart === null) return;

    const distance = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(distance) > 48) {
      distance > 0 ? goTo.next() : goTo.previous();
    }

    setTouchStart(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] bg-black/85 px-4 py-5 backdrop-blur-xl sm:px-8 md:px-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio image gallery"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,164,108,0.08),transparent_42%)]" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex min-h-12 items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-white/70">
              <span>
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(images.length).padStart(2, "0")}
              </span>

              <button
                type="button"
                onClick={onClose}
                className="min-h-12 px-2 text-white transition hover:text-[var(--accent-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]"
                aria-label="Close gallery"
              >
                Close
              </button>
            </div>

            <div
              className="relative flex flex-1 items-center justify-center"
              onTouchStart={(event) =>
                setTouchStart(event.changedTouches[0].clientX)
              }
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                onClick={goTo.previous}
                className="absolute left-0 z-20 hidden min-h-12 w-12 items-center justify-center border border-white/10 bg-black/30 text-2xl text-white backdrop-blur transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] md:flex"
                aria-label="Previous image"
              >
                &lt;
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage.src}
                  className="relative h-[74vh] w-full max-w-6xl"
                  initial={{ opacity: 0, scale: 0.985, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.985, y: -10 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    quality={90}
                    preload
                  />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={goTo.next}
                className="absolute right-0 z-20 hidden min-h-12 w-12 items-center justify-center border border-white/10 bg-black/30 text-2xl text-white backdrop-blur transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] md:flex"
                aria-label="Next image"
              >
                &gt;
              </button>
            </div>

            <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 pb-3 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
                {activeImage.category}
              </p>
              <p className="font-serif text-xl text-white sm:text-2xl">
                {activeImage.title}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
