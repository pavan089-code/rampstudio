"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const services = [
  {
    title: "Weddings",
    description:
      "Emotionally rich wedding storytelling crafted with cinematic depth and timeless elegance.",
    image: "/marraige/wed2.jpeg",
  },
  {
    title: "Pre-Wedding",
    description:
      "Intimate visual narratives designed to feel natural, atmospheric, and deeply personal.",
    image: "/prewed/prewed1.jpeg",
  },
  {
    title: "Engagements",
    description:
      "Quiet moments, honest connection, and refined imagery that celebrates your story.",
    image: "/prewed/sang1.jpeg",
  },
  {
    title: "Destination Weddings",
    description:
      "Immersive wedding films and photography captured across extraordinary locations.",
    image: "/marraige/hero.jpeg",
  },
  {
    title: "Events",
    description:
      "Elegant event coverage preserving atmosphere, energy, and authentic human emotion.",
    image: "/marraige/img2.jpeg",
  },
  {
    title: "Meternity & Newborn",
    description:
      "Short-form cinematic storytelling crafted with movement, rhythm, and mood.",
    image: "/meternity/met1.jpeg",
  },
];

export default function Services() {
  return (
    <section className="relative bg-black text-white py-28 md:py-40 overflow-hidden">
      {/* Ambient light */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-white/5 blur-[160px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="uppercase tracking-[0.35em] text-[11px] text-neutral-500">
            Services
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] max-w-4xl">
            Crafted to preserve stories
            <span className="block text-neutral-500">
              with emotion, atmosphere, and timeless detail.
            </span>
          </h2>
        </motion.div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
              }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03]"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw,
         (max-width: 1024px) 50vw,
         50vw"
                  className="object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition duration-1000 ease-out"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition duration-700" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                <div className="translate-y-4 group-hover:translate-y-0 transition duration-500">
                  <span className="uppercase tracking-[0.3em] text-[10px] text-neutral-400">
                    Signature Service
                  </span>

                  <h3 className="mt-3 text-3xl md:text-4xl font-light tracking-tight">
                    {service.title}
                  </h3>

                  <p className="mt-5 text-sm md:text-[15px] leading-[1.9] text-neutral-300 max-w-md opacity-0 group-hover:opacity-100 transition duration-500">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
