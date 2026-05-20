"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function StorySection() {
  return (
    <section className="relative overflow-hidden bg-black text-white py-28 md:py-40">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-white/10 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-24 items-center">

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
              <Image
                src="/found.PNG"
                alt="Ramp Studio Founder"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Floating Label */}
            <div className="absolute -bottom-6 left-6 backdrop-blur-xl bg-white/5 border border-white/10 px-5 py-3 rounded-full">
              <p className="text-xs tracking-[0.25em] uppercase text-neutral-300">
                Ramp Studio
              </p>
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            {/* Eyebrow */}
            <p className="text-sm uppercase tracking-[0.35em] text-neutral-500 mb-6">
              Our Philosophy
            </p>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-6xl leading-[1.05] font-light tracking-tight">
              We don’t just capture people.
              <span className="block text-neutral-500 mt-2">
                We preserve emotion.
              </span>
            </h2>

            {/* Story Copy */}
            <div className="mt-10 space-y-6 text-neutral-300 leading-relaxed text-[15px] md:text-[17px]">
              <p>
                Every frame we create is built around feeling — the quiet pauses,
                the imperfect smiles, the atmosphere that exists between moments.
              </p>

              <p>
                At Ramp Studio, photography is not about trends or poses. It is
                about creating cinematic memories that feel timeless years later.
              </p>

              <p>
                We approach weddings, portraits, and stories with the eye of a
                filmmaker and the sensitivity of a documentarian.
              </p>
            </div>

            {/* Quote */}
            <div className="mt-12 border-l border-white/20 pl-6">
              <p className="text-xl md:text-2xl italic text-neutral-100 leading-relaxed">
                “The best photographs are the ones that still feel alive long
                after the moment has passed.”
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}