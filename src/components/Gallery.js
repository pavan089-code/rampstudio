"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Reveal from "./Reveal";

export default function Gallery() {
  const images = [
    "/img2.jpeg",
    "/img5.jpeg",
    "/img3.jpeg",
    "/img4.jpeg",
    "/img2.jpeg",
    "/img5.jpeg",
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      {/* Gallery */}
      <div className="columns-1 md:columns-2 gap-6 space-y-6">

        {images.map((img, i) => (
          <Reveal key={i} delay={i * 0.08}>

            <div
              className="
                overflow-hidden
                rounded-sm
                group
                relative
                cursor-pointer
              "
              onClick={() => setSelectedImage(img)}
            >

              <img
                src={img}
                alt=""
                className="
                  w-full
                  mb-6
                  object-cover
                  transition duration-700
                  group-hover:scale-105
                  group-hover:opacity-90
                "
              />

              {/* Hover Overlay */}
              <div
                className="
                  absolute inset-0
                  bg-black/0
                  group-hover:bg-black/10
                  transition duration-500
                "
              />

            </div>

          </Reveal>
        ))}

      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>

        {selectedImage && (

          <motion.div
            className="
              fixed inset-0 z-[100]
              bg-black/95
              flex items-center justify-center
              p-4 md:p-10
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="
                absolute top-6 right-6
                text-white text-4xl
                hover:text-[var(--accent-gold)]
                transition
              "
            >
              ×
            </button>

            {/* Image */}
            <motion.img
              src={selectedImage}
              alt=""
              className="
                max-w-full
                max-h-full
                object-contain
                rounded-sm
              "
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />

          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}