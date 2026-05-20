
"use client";

import Button from "@/components/Button";
import Reveal from "@/components/Reveal";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const collections = [
  "Wedding",
  "Engagement",
  "Destination",
  "Editorial Portraits",
];

const styles = [
  "Editorial",
  "Documentary",
  "Luxury",
  "Moody",
  "Minimal",
  "Traditional",
];

const budgets = [
  "50K – 1L",
  "1L – 2L",
  "2L – 5L",
  "Luxury Custom",
];

const steps = [
  {
    eyebrow: "01 / Collection",
    title: "What are we creating?",
    copy: "Choose the story closest to your celebration.",
  },
  {
    eyebrow: "02 / Date & Place",
    title: "Where should the story unfold?",
    copy: "Share the event timing and location so we can confirm availability.",
  },
  {
    eyebrow: "03 / Direction",
    title: "What atmosphere feels right?",
    copy: "Select the visual language you feel emotionally connected to.",
  },
  {
    eyebrow: "04 / Contact",
    title: "How can we reach you?",
    copy: "A few details so the studio can prepare a thoughtful response.",
  },
  {
    eyebrow: "05 / Notes",
    title: "Tell us the feeling.",
    copy: "Share the mood, rituals, timeline, or moments you want remembered forever.",
  },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    eventType: "Wedding",
    date: null,
    location: "",
    guestCount: "",
    photographyStyle: "Editorial",
    budget: "1L – 2L",
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    message: "",
  });

  const progress = useMemo(
    () => Math.round(((currentStep + 1) / steps.length) * 100),
    [currentStep]
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.date) {
        newErrors.date = "Please share your preferred date or season.";
      }

      if (!formData.location) {
        newErrors.location = "Tell us where the story will take place.";
      }
    }

    if (currentStep === 3) {
      if (!formData.name) {
        newErrors.name = "We’d love to know your name.";
      }

      if (!formData.email) {
        newErrors.email = "Please share your email so the studio can respond thoughtfully.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        date: formData.date?.toISOString(),
      }),
    });

    setIsSubmitting(false);

    if (response.ok) {
      setIsSuccess(true);

      setTimeout(() => {
        setCurrentStep(0);

        setFormData({
          eventType: "Wedding",
          date: null,
          location: "",
          guestCount: "",
          photographyStyle: "Editorial",
          budget: "1L – 2L",
          name: "",
          email: "",
          phone: "",
          whatsapp: "",
          message: "",
        });
      }, 2500);
    }
  };

  return (
    <main className="min-h-screen bg-primary px-5 pb-24 pt-32 text-white sm:px-8 md:px-16 md:pb-32 md:pt-40">
      <Reveal>
        <div className="mx-auto mb-12 grid max-w-7xl gap-10 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
              Booking
            </p>

            <h1 className="font-serif text-5xl leading-[1.02] sm:text-6xl md:text-8xl">
              Begin Your Story
            </h1>
          </div>

          <p className="max-w-xl text-sm leading-7 text-muted sm:text-base md:col-span-5 md:ml-auto">
            A refined inquiry experience for couples and families who want
            imagery with emotion, elegance, and cinematic depth.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.82fr_1.18fr] md:gap-10">
          <aside className="border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:sticky md:top-28 md:self-start backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.18em] text-white/45">
              <span>Inquiry Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="mt-5 h-px bg-white/10">
              <motion.div
                className="h-px bg-[var(--accent-gold)]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="mt-10 space-y-6">
              {steps.map((step, index) => (
                <button
                  key={step.eyebrow}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`block w-full border-l px-4 py-1 text-left transition duration-300 ${
                    currentStep === index
                      ? "border-[var(--accent-gold)] text-white"
                      : "border-white/10 text-white/45 hover:border-white/30 hover:text-white/70"
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-[0.2em]">
                    {step.eyebrow}
                  </span>

                  <span className="mt-2 block font-serif text-xl">
                    {step.title}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-12 border-t border-white/10 pt-6 text-sm leading-7 text-muted">
              We respond with availability, approach, and next steps after
              reviewing the details.
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="relative min-h-[680px] overflow-hidden border border-white/10 bg-black/25 p-6 sm:p-8 md:p-12 backdrop-blur-xl"
          >
            {isSubmitting && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xl">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-gold)]" />

                <p className="mt-6 text-sm uppercase tracking-[0.24em] text-white/70">
                  Crafting Your Inquiry
                </p>
              </div>
            )}

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[520px] flex-col items-center justify-center text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)]/10">
                  <Check className="h-9 w-9 text-[var(--accent-gold)]" />
                </div>

                <h2 className="mt-10 font-serif text-5xl leading-tight">
                  Your story has
                  <span className="block text-[var(--accent-gold)]">
                    been received.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-sm leading-8 text-muted sm:text-base">
                  The studio will review your inquiry and reach out shortly with
                  availability, next steps, and a thoughtfully curated response.
                </p>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
                      {steps[currentStep].eyebrow}
                    </p>

                    <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                      {steps[currentStep].title}
                    </h2>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
                      {steps[currentStep].copy}
                    </p>

                    {currentStep === 0 && (
                      <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        {collections.map((collection) => (
                          <button
                            key={collection}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, eventType: collection })
                            }
                            className={`min-h-28 border p-5 text-left transition duration-500 ${
                              formData.eventType === collection
                                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-white"
                                : "border-white/10 bg-white/[0.025] text-white/70 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            <span className="text-xs uppercase tracking-[0.18em]">
                              Collection
                            </span>

                            <span className="mt-3 block font-serif text-2xl">
                              {collection}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="mt-10 grid gap-6">
                        <div>
                          <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted">
                            Preferred Date
                          </label>

                          <DatePicker
                            selected={formData.date}
                            onChange={(date) =>
                              setFormData({ ...formData, date })
                            }
                            placeholderText="Select a preferred date"
                            className="field-surface w-full px-5 py-4"
                          />

                          {errors.date && (
                            <p className="mt-3 text-sm text-[var(--accent-gold)]">
                              {errors.date}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted">
                            Location
                          </label>

                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, venue, or destination"
                            className="field-surface w-full px-5 py-4"
                          />

                          {errors.location && (
                            <p className="mt-3 text-sm text-[var(--accent-gold)]">
                              {errors.location}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted">
                            Guest Count
                          </label>

                          <input
                            type="text"
                            name="guestCount"
                            value={formData.guestCount}
                            onChange={handleChange}
                            placeholder="Approximate guest count"
                            className="field-surface w-full px-5 py-4"
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="mt-10 space-y-10">
                        <div>
                          <label className="mb-5 block text-xs uppercase tracking-[0.18em] text-muted">
                            Preferred Photography Style
                          </label>

                          <div className="flex flex-wrap gap-4">
                            {styles.map((style) => (
                              <button
                                key={style}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    photographyStyle: style,
                                  })
                                }
                                className={`rounded-full border px-5 py-3 text-sm transition duration-300 ${
                                  formData.photographyStyle === style
                                    ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-white"
                                    : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="mb-5 block text-xs uppercase tracking-[0.18em] text-muted">
                            Estimated Budget Range
                          </label>

                          <div className="grid gap-4 sm:grid-cols-2">
                            {budgets.map((budget) => (
                              <button
                                key={budget}
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, budget })
                                }
                                className={`border p-5 text-left transition duration-300 ${
                                  formData.budget === budget
                                    ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10"
                                    : "border-white/10 bg-white/[0.03] hover:border-white/30"
                                }`}
                              >
                                <span className="font-serif text-2xl">
                                  {budget}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="mt-10 grid gap-6">
                        <div>
                          <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted">
                            Full Name
                          </label>

                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            className="field-surface w-full px-5 py-4"
                          />

                          {errors.name && (
                            <p className="mt-3 text-sm text-[var(--accent-gold)]">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                          <div>
                            <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted">
                              Email
                            </label>

                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="you@example.com"
                              className="field-surface w-full px-5 py-4"
                            />

                            {errors.email && (
                              <p className="mt-3 text-sm text-[var(--accent-gold)]">
                                {errors.email}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted">
                              Phone
                            </label>

                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Phone number"
                              className="field-surface w-full px-5 py-4"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted">
                            WhatsApp
                          </label>

                          <input
                            type="tel"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            placeholder="Preferred WhatsApp number"
                            className="field-surface w-full px-5 py-4"
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="mt-10 grid gap-7">
                        <div>
                          <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted">
                            Vision Notes
                          </label>

                          <textarea
                            rows="7"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us about the mood, rituals, timeline, and what you want to remember forever."
                            className="field-surface w-full resize-none px-5 py-4"
                          />
                        </div>

                        <div className="grid gap-5 border border-white/10 bg-white/[0.025] p-6 text-sm leading-7 text-muted sm:grid-cols-2">
                          <div>
                            <span className="block text-xs uppercase tracking-[0.18em] text-white/45">
                              Collection
                            </span>
                            {formData.eventType}
                          </div>

                          <div>
                            <span className="block text-xs uppercase tracking-[0.18em] text-white/45">
                              Style
                            </span>
                            {formData.photographyStyle}
                          </div>

                          <div>
                            <span className="block text-xs uppercase tracking-[0.18em] text-white/45">
                              Budget
                            </span>
                            {formData.budget}
                          </div>

                          <div>
                            <span className="block text-xs uppercase tracking-[0.18em] text-white/45">
                              Location
                            </span>
                            {formData.location || "To be shared"}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentStep === 0}
                    className="min-h-12 text-xs uppercase tracking-[0.2em] text-white/50 transition hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    Back
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <Button type="button" variant="outline" onClick={goNext}>
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="w-full sm:w-fit"
                    >
                      Send Inquiry
                    </Button>
                  )}
                </div>
              </>
            )}
          </form>
        </section>
      </Reveal>
    </main>
  );
}



