"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How far in advance should we book?",
    answer:
      "We recommend reserving your date at least 3–6 months in advance, especially during peak wedding seasons and destination schedules.",
  },
  {
    question: "Do you travel for destination weddings?",
    answer:
      "Yes. Ramp Studio is available for destination weddings and events across India and internationally, depending on availability.",
  },
  {
    question: "How long does editing and delivery take?",
    answer:
      "Our editing process is intentionally meticulous. Most galleries are delivered within 3–5 weeks, while cinematic reels may take slightly longer.",
  },
  {
    question: "What does the booking process look like?",
    answer:
      "After an initial consultation, we finalize your coverage details, confirm availability, and secure the booking through a signed agreement and retainer.",
  },
  {
    question: "What will we receive after the shoot?",
    answer:
      "Depending on the selected experience, you’ll receive a curated gallery of professionally edited photographs, cinematic reels, and downloadable high-resolution files.",
  },
  {
    question: "Do you provide full-day event coverage?",
    answer:
      "Yes. We offer flexible coverage options ranging from intimate sessions to full-day wedding and event storytelling experiences.",
  },
];

export default function Faq() {
  const [active, setActive] = useState(0);

  const toggleFaq = (index) => {
    setActive(active === index ? null : index);
  };

  return (
    <section className="relative bg-black text-white py-28 md:py-40 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-1/3 top-1/4 w-[500px] h-[500px] bg-white/5 blur-[160px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 md:px-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="uppercase tracking-[0.35em] text-[11px] text-neutral-500">
            Frequently Asked
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] max-w-3xl">
            Thoughtfully answered
            <span className="block text-neutral-500">
              before your story begins.
            </span>
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-5">
          {faqs.map((faq, index) => {
            const isActive = active === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.05,
                }}
                viewport={{ once: true }}
                className="border border-white/10 rounded-[28px] bg-white/[0.03] backdrop-blur-sm overflow-hidden"
              >
                {/* Question */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left px-7 md:px-10 py-7"
                >
                  <h3 className="text-lg md:text-xl font-light tracking-tight text-white pr-8">
                    {faq.question}
                  </h3>

                  <div className="text-neutral-400 flex-shrink-0">
                    {isActive ? (
                      <Minus size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="px-7 md:px-10 pb-8 max-w-3xl">
                        <p className="text-neutral-300 leading-[1.9] text-[15px] md:text-[16px]">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}