"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phoneNumber = "19803830625";

  const message =
    "Hi Ramp Studio, I’d like to book a wedding shoot.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        scale: 1.06,
      }}
      whileTap={{
        scale: 0.96,
      }}
      className="
        fixed
        bottom-5
        right-5
        md:bottom-6
        md:right-6
        z-[9999]
      "
      aria-label="Chat on WhatsApp"
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-[var(--accent-gold)]/20 blur-2xl opacity-70" />

      {/* Button */}
      <div
        className="
          relative
          flex items-center justify-center
          h-14 w-14
          md:h-16 md:w-16
          rounded-full
          border border-white/10
          bg-black/70
          backdrop-blur-2xl
          shadow-[0_10px_40px_rgba(0,0,0,0.45)]
          transition-all duration-500
          hover:border-[var(--accent-gold)]
          hover:bg-black/85
        "
      >
        <MessageCircle
          size={24}
          strokeWidth={1.8}
          className="text-white"
        />
      </div>
    </motion.a>
  );
}