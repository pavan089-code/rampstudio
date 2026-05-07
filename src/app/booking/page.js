"use client";

import Reveal from "@/components/Reveal";

export default function BookingPage() {
  return (
    <main className="bg-primary min-h-screen text-white pt-32 px-6 md:px-16 pb-24">

      <Reveal>

        {/* Heading */}
        <div className="max-w-3xl mb-20">

          <p className="text-[var(--accent-gold)] tracking-[0.2em] uppercase text-sm mb-4">
            Booking
          </p>

          <h1 className="text-5xl md:text-7xl font-serif leading-tight">
            Let’s Capture Your Story
          </h1>

          <p className="text-muted mt-6 max-w-xl leading-relaxed">
            Share your vision, event details, and preferred dates.
            We’ll get back to you with availability and pricing.
          </p>

        </div>

      </Reveal>

      {/* Form */}
      <Reveal delay={0.1}>

        <form className="max-w-3xl grid gap-8">

          {/* Name */}
          <div>
            <label className="block text-sm tracking-wide mb-3 text-muted">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Your name"
              className="
                w-full
                bg-secondary
                border border-white/10
                px-5 py-4
                outline-none
                text-white
                focus:border-[var(--accent-gold)]
                transition
              "
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm tracking-wide mb-3 text-muted">
              Email Address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="
                w-full
                bg-secondary
                border border-white/10
                px-5 py-4
                outline-none
                text-white
                focus:border-[var(--accent-gold)]
                transition
              "
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm tracking-wide mb-3 text-muted">
              Event Type
            </label>

            <input
              type="text"
              placeholder="Wedding / Engagement / Event"
              className="
                w-full
                bg-secondary
                border border-white/10
                px-5 py-4
                outline-none
                text-white
                focus:border-[var(--accent-gold)]
                transition
              "
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm tracking-wide mb-3 text-muted">
              Tell Us About Your Event
            </label>

            <textarea
              rows="6"
              placeholder="Describe your event..."
              className="
                w-full
                bg-secondary
                border border-white/10
                px-5 py-4
                outline-none
                text-white
                focus:border-[var(--accent-gold)]
                transition
                resize-none
              "
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="
              btn-outline
              w-fit
            "
          >
            Send Inquiry
          </button>

        </form>

      </Reveal>

    </main>
  );
}