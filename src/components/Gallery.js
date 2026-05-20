"use client";

import Image from "next/image";
import { useState } from "react";
import GalleryLightbox from "./GalleryLightbox";

const images = [
  {
    src: "/img2.jpeg",
    title: "The Ceremony Edit",
    category: "Wedding Story",
    location: "Golden Hour",
    alt: "Cinematic wedding ceremony captured by Ramp Studio",
  },
  {
    src: "/img3.jpeg",
    title: "Quiet Vows",
    category: "Intimate Moments",
    location: "Private Rituals",
    alt: "Emotional wedding portrait by Ramp Studio",
  },
  {
    src: "/img4.jpeg",
    title: "Reception Afterglow",
    category: "Celebration",
    location: "Evening Light",
    alt: "Luxury wedding reception photography by Ramp Studio",
  },
  {
    src: "/img5.jpeg",
    title: "Editorial Bride",
    category: "Portraiture",
    location: "Fashion Inspired",
    alt: "Editorial bridal portrait photographed by Ramp Studio",
  },
];

const layout = [
  "md:col-span-8 md:aspect-[16/10]",
  "md:col-span-4 md:mt-28 md:aspect-[3/4]",
  "md:col-span-5 md:aspect-[4/5]",
  "md:col-span-7 md:mt-20 md:aspect-[16/11]",
];

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <section className="pb-24 md:pb-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            Selected Chapters
          </p>
          <div className="hidden h-px flex-1 bg-white/10 md:block" />
        </div>

        <div className="grid grid-cols-1 gap-y-12 sm:gap-y-14 md:grid-cols-12 md:items-start md:gap-x-8 md:gap-y-20">
        {images.map((image, index) => (
          <article key={image.src} className={layout[index]}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative block aspect-[4/5] w-full overflow-hidden bg-white/[0.03] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] md:aspect-[inherit]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading="lazy"
                className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                sizes={
                  index === 0 || index === 3
                    ? "(max-width: 768px) 100vw, 66vw"
                    : "(max-width: 768px) 100vw, 34vw"
                }
                quality={86}
              />
              <div className="absolute inset-0 bg-black/0 transition duration-700 group-hover:bg-black/12" />
              <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center border border-white/20 bg-black/20 text-[11px] tracking-[0.18em] text-white backdrop-blur-sm transition duration-500 group-hover:border-[var(--accent-gold)] group-hover:text-[var(--accent-gold)] sm:left-5 sm:top-5">
                {String(index + 1).padStart(2, "0")}
              </div>
            </button>

            <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
                  {image.category}
                </p>
                <h2 className="mt-2 font-serif text-2xl leading-tight text-white sm:text-3xl">
                  {image.title}
                </h2>
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-white/45 sm:pt-1">
                {image.location}
              </p>
            </div>
          </article>
        ))}
        </div>
      </div>

      <GalleryLightbox
        images={images}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onSelect={setActiveIndex}
      />
    </section>
  );
}
