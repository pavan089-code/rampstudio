// src/sections/home/FeaturedWork.js
import Reveal from "@/components/Reveal";
export default function FeaturedWork() {
  const images = [
    "/img2.jpeg",
    "/img5.jpeg",
    "/img3.jpeg",
    "/img4.jpeg",
  ];

  return (
    <Reveal>
      <section className=" bg-primary py-28 px-6 md:px-16 bg-[radial-gradient(circle_at_top,rgba(198,164,108,0.05),transparent_40%)]">

        {/* Heading */}
        <Reveal>
          <div className="mb-14">
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide">
              Featured Work
            </h2>
          </div>
        </Reveal>

        <div className="w-20 h-[1px] bg-[var(--accent-gold)] mt-4" />

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8">

          {images.map((img, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div
                key={i}
                className="group overflow-hidden rounded-sm relative"
              >

              {/* Image */}
              <img
                src={img}
                alt=""
                className="
                w-full 
                h-[420px] 
                object-cover
                transition
                duration-700
                group-hover:scale-105
                group-hover:opacity-90
              "
              />

              {/* Subtle dark overlay on hover */}
              <div className="
              absolute inset-0
              bg-black/0
              group-hover:bg-black/10
              transition duration-500
            " />

            </div>
            </Reveal>
          ))}

        </div>

      </section>
    </Reveal>
  );
}