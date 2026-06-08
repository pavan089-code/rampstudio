"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import GalleryLightbox from "./GalleryLightbox";

const allCategory = { slug: "all", label: "All" };

const reveal = {
  hidden: { opacity: 0, scale: 0.985, y: 22 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

function useNearViewport(rootMargin = "900px 0px") {
  const ref = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (isNearViewport || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isNearViewport, rootMargin]);

  return [ref, isNearViewport];
}

function GalleryCard({ image, index, onOpen }) {
  const [cardRef, isNearViewport] = useNearViewport();

  return (
    <motion.article
      ref={cardRef}
      className="mb-3 break-inside-avoid sm:mb-4 md:mb-5 xl:mb-6"
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.64,
        delay: (index % 6) * 0.035,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(index)}
        className="group relative block w-full overflow-hidden rounded-[1.15rem] bg-white/[0.035] text-left shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/[0.055] transition duration-500 hover:shadow-[0_24px_80px_rgba(0,0,0,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
        aria-label={`Open ${image.title}`}
      >
        {isNearViewport && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            loading="lazy"
            className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, (max-width: 1799px) 20vw, 16vw"
            quality={86}
          />
        )}

        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition duration-700 group-hover:opacity-100" />
        <span className="absolute bottom-3 left-3 translate-y-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.22em] text-[var(--accent-soft)] opacity-0 backdrop-blur-md transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-4 sm:left-4">
          {image.category}
        </span>
      </button>
    </motion.article>
  );
}

export default function Gallery({ categories, totalImages }) {
  const [activeCategory, setActiveCategory] = useState(allCategory.slug);
  const [activeIndex, setActiveIndex] = useState(null);

  const allImages = useMemo(
    () => categories.flatMap((category) => category.images),
    [categories]
  );

  const filteredImages = useMemo(() => {
    if (activeCategory === allCategory.slug) return allImages;
    return (
      categories.find((category) => category.slug === activeCategory)?.images ??
      []
    );
  }, [activeCategory, allImages, categories]);

  const activeCategoryLabel =
    activeCategory === allCategory.slug
      ? allCategory.label
      : categories.find((category) => category.slug === activeCategory)?.label;

  const selectCategory = (slug) => {
    setActiveCategory(slug);
    setActiveIndex(null);
  };

  return (
    <section className="pb-24 md:pb-36">
      <div className="mx-auto max-w-[1760px]">
        <div className="mb-8 grid gap-6 border-y border-white/10 py-6 md:mb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
              Featured Portfolio
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
              Explore our portfolio of {totalImages}+ captured moments across
              birthdays, weddings, maternity, model shoots, and pre-wedding
              stories.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.18em] text-white/55 sm:flex sm:gap-8">
            <span>{totalImages} Moments</span>
            <span>{categories.length} Categories</span>
          </div>
        </div>

        <div className="-mx-6 mb-8 overflow-x-auto px-6 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:mb-10 md:px-0">
          <div className="flex min-w-max gap-3 md:grid md:min-w-0 md:grid-cols-6 md:gap-4">
            <button
              type="button"
              onClick={() => selectCategory(allCategory.slug)}
              aria-pressed={activeCategory === allCategory.slug}
              className={`group flex min-h-24 w-32 flex-col justify-end rounded-2xl border p-3 text-left transition duration-500 md:w-auto ${
                activeCategory === allCategory.slug
                  ? "border-[var(--accent-gold)] bg-white/[0.075] shadow-[0_20px_70px_rgba(198,164,108,0.08)]"
                  : "border-white/10 bg-white/[0.025] hover:border-white/30"
              }`}
            >
              <span className="text-[9px] uppercase tracking-[0.22em] text-white/40">
                Complete Edit
              </span>
              <span className="mt-2 flex items-end justify-between gap-3">
                <span className="font-serif text-lg text-white">All</span>
                <span className="text-[9px] tracking-[0.16em] text-white/60">
                  {totalImages}
                </span>
              </span>
            </button>

            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => selectCategory(category.slug)}
                aria-pressed={activeCategory === category.slug}
                className={`group relative h-24 w-36 overflow-hidden rounded-2xl border text-left shadow-[0_18px_60px_rgba(0,0,0,0.2)] transition duration-500 md:w-auto ${
                  activeCategory === category.slug
                    ? "border-[var(--accent-gold)]"
                    : "border-white/10 hover:border-white/35"
                }`}
              >
                <Image
                  src={category.cover.src}
                  alt={`${category.label} portfolio cover`}
                  fill
                  loading="lazy"
                  className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  sizes="(max-width: 767px) 144px, 14vw"
                  quality={75}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition duration-500 group-hover:from-black/68" />
                <span className="absolute inset-x-0 bottom-0 p-3">
                  <span className="flex items-end justify-between gap-2">
                    <span className="font-serif text-base leading-none text-white">
                      {category.label}
                    </span>
                    <span className="text-[9px] tracking-[0.16em] text-white/65">
                      {category.images.length}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-end justify-between gap-6">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            {activeCategoryLabel} Showcase
          </p>
          <div className="hidden h-px flex-1 bg-white/10 md:block" />
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">
            {filteredImages.length} Frames
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="columns-2 gap-3 sm:gap-4 md:columns-3 md:gap-5 xl:columns-4 2xl:columns-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            {filteredImages.map((image, index) => (
              <GalleryCard
                key={image.src}
                image={image}
                index={index}
                onOpen={setActiveIndex}
              />
            ))}
          </motion.div>
        </AnimatePresence>

      </div>

      <GalleryLightbox
        images={filteredImages}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onSelect={setActiveIndex}
      />
    </section>
  );
}
