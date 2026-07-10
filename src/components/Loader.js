"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let loadTimer;
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 850);

    const handleLoaded = () => {
      loadTimer = setTimeout(() => setLoading(false), 120);
    };

    if (document.readyState === "complete") {
      handleLoaded();
    } else {
      window.addEventListener("load", handleLoaded, { once: true });
    }

    return () => {
      clearTimeout(fallbackTimer);
      clearTimeout(loadTimer);
      window.removeEventListener("load", handleLoaded);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-white text-3xl tracking-[0.3em] uppercase"
          >
            Ramp Studio
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
