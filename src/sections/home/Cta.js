import Reveal from "@/components/Reveal";
export default function CTA() {
  return (
    <Reveal>
    <section className="bg-secondary py-28 px-6 md:px-16 text-center">

      <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
        Let’s Create Something{" "}
        <span className="text-[var(--accent-gold)] italic">
          Beautiful
        </span>
      </h2>

      <p className="mt-5 text-muted">
        Book your wedding or event with Ramp Studio
      </p>

      <div className="mt-10">
        <button className="btn-outline">
          Book Appointment
        </button>
      </div>

    </section>
    </Reveal>
  );
}