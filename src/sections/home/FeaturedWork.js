// src/sections/home/FeaturedWork.js
import Image from "next/image";
import Reveal from "../../components/Reveal";

export default function FeaturedWork() {
  const images = [
    {
      src: "/marraige/img2.jpeg",
      title: "Ceremony",
      span: "md:col-span-7",
      frame: "md:aspect-[16/11]",
    },
    {
      src: "/marraige/img5.jpeg",
      title: "Portraits",
      span: "md:col-span-5 md:mt-16",
      frame: "md:aspect-[4/5]",
    },
    {
      src: "/marraige/img3.jpeg",
      title: "Details",
      span: "md:col-span-5",
      frame: "md:aspect-[4/5]",
    },
    {
      src: "/marraige/img4.jpeg",
      title: "Celebration",
      span: "md:col-span-7 md:mt-12",
      frame: "md:aspect-[16/11]",
    },
  ];

  return (
    <Reveal>
      <section className="bg-primary px-6 py-24 sm:px-8 md:px-16 md:py-32">
        <Reveal>
          <div className="mb-12 max-w-2xl md:mb-16">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
              Selected Frames
            </p>
            <h2 className="font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
              Featured Work
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted sm:text-base">
              Emotional, cinematic stories composed with an editorial eye.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-12 md:items-start md:gap-8">
          {images.map((img, i) => (
            <Reveal key={img.src} delay={i * 0.1} className={img.span}>
              <div
                className={`group relative aspect-[4/5] overflow-hidden bg-white/[0.03] ${img.frame}`}
              >
                <Image
                  src={img.src}
                  alt={`${img.title} wedding photography by Ramp Studio`}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] group-hover:opacity-95"
                  quality={86}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition duration-500 group-hover:opacity-95" />
                <p className="absolute bottom-5 left-5 text-xs uppercase tracking-[0.22em] text-white/80">
                  {img.title}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
