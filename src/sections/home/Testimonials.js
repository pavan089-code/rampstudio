"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Aarav & Meera",
    event: "Wedding Story",
    image: "/rew1.jpg",
    text: "Every frame felt deeply personal. Ramp Studio captured emotions we didn’t even realize we were expressing.",
  },
  {
    name: "Rohit & Ananya",
    event: "Engagement Session",
    image: "/rew2.jpg",
    text: "The photographs feel timeless — cinematic without losing intimacy. Looking at them feels like reliving the entire evening.",
  },
  {
    name: "Daniel & Priya",
    event: "Destination Wedding",
    image: "/rew3.jpg",
    text: "Nothing felt staged. The atmosphere, movement, and emotion were preserved beautifully and honestly.",
  },
  {
    name: "Kiran & Sophia",
    event: "Pre-Wedding Film",
    image: "/rew4.jpg",
    text: "The experience felt calm, artistic, and intentional. The final imagery feels like scenes from a film.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-black text-white overflow-hidden py-28 md:py-40">
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/5 blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="uppercase tracking-[0.35em] text-[11px] text-neutral-500">
            Client Experiences
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight max-w-3xl">
            Stories remembered through emotion,
            <span className="block text-neutral-500">
              atmosphere, and honest moments.
            </span>
          </h2>
        </motion.div>

        {/* Marquee Rail */}
        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex gap-8 w-max"
          >
            {[...testimonials, ...testimonials].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4 }}
                className="group relative w-[340px] md:w-[400px] border border-white/10 bg-white/[0.03] backdrop-blur-sm rounded-[28px] p-8 flex-shrink-0"
              >
                {/* Quote */}
                <p className="text-[17px] leading-[1.9] text-neutral-200 font-light">
                  “{item.text}”
                </p>

                {/* Bottom */}
                <div className="mt-10 flex items-center gap-4">
                  {/* Portrait */}
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover grayscale group-hover:grayscale-0 transition duration-700"
                    />
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-sm tracking-wide text-white">
                      {item.name}
                    </h3>

                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mt-1">
                      {item.event}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Edge fades */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}