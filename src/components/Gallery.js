"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import GalleryLightbox from "./GalleryLightbox";

const allCategory = { slug: "all", label: "All" };

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export default function Gallery({ categories }) {
  const [activeCategory, setActiveCategory] = useState(allCategory.slug);
  const [activeIndex, setActiveIndex] = useState(null);

  const filteredImages = useMemo(() => {
    if (activeCategory === allCategory.slug) {
      return categories.flatMap((category) => category.images);
    }

    return (
      categories.find((category) => category.slug === activeCategory)?.images ??
      []
    );
  }, [activeCategory, categories]);

  const selectCategory = (slug) => {
    setActiveCategory(slug);
    setActiveIndex(null);
  };

  return (
    <section className="pb-24 md:pb-36">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            Selected Chapters
          </p>
          <div className="hidden h-px flex-1 bg-white/10 md:block" />
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">
            {String(filteredImages.length).padStart(2, "0")} Frames
          </p>
        </div>

        <div className="-mx-6 mb-8 overflow-x-auto px-6 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:mb-10 md:px-0">
          <div className="flex min-w-max gap-3 md:grid md:min-w-0 md:grid-cols-6 md:gap-4">
            <button
              type="button"
              onClick={() => selectCategory(allCategory.slug)}
              aria-pressed={activeCategory === allCategory.slug}
              className={`group flex min-h-24 w-28 flex-col justify-end border p-3 text-left transition duration-500 md:w-auto ${
                activeCategory === allCategory.slug
                  ? "border-[var(--accent-gold)] bg-white/[0.07]"
                  : "border-white/10 bg-white/[0.025] hover:border-white/30"
              }`}
            >
              <span className="text-[9px] uppercase tracking-[0.22em] text-white/40">
                Complete Edit
              </span>
              <span className="mt-2 font-serif text-lg text-white">All</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => selectCategory(category.slug)}
                aria-pressed={activeCategory === category.slug}
                className={`group relative h-24 w-32 overflow-hidden border text-left transition duration-500 md:w-auto ${
                  activeCategory === category.slug
                    ? "border-[var(--accent-gold)]"
                    : "border-white/10 hover:border-white/35"
                }`}
              >
                <Image
                  src={category.cover.src}
                  alt={`${category.label} portfolio cover`}
                  fill
                  className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  sizes="(max-width: 767px) 128px, 16vw"
                  quality={75}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 transition duration-500 group-hover:from-black/65" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                  <span className="font-serif text-base text-white">
                    {category.label}
                  </span>
                  <span className="text-[9px] tracking-[0.16em] text-white/65">
                    {String(category.images.length).padStart(2, "0")}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="columns-2 gap-3 sm:gap-4 md:columns-3 md:gap-5 xl:columns-4 2xl:columns-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {filteredImages.map((image, index) => (
              <motion.article
                key={image.src}
                className="mb-3 break-inside-avoid sm:mb-4 md:mb-5"
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.68,
                  delay: (index % 5) * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group relative block w-full overflow-hidden bg-white/[0.03] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]"
                  aria-label={`Open ${image.title}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    className="h-auto w-full transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                    sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, (max-width: 1535px) 25vw, 20vw"
                    quality={86}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-45 transition duration-700 group-hover:opacity-100" />
                  <span className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:p-4">
                    <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--accent-soft)]">
                      {image.category}
                    </span>
                  </span>
                </button>
              </motion.article>
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
