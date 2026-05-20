import Button from "@/components/Button";
import Reveal from "../../components/Reveal";
import Link from "next/link";

export default function CTA() {
  return (
    <Reveal>
      <section className="bg-secondary px-6 py-24 text-center sm:px-8 md:px-16 md:py-32">
        <h2 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
          Let&apos;s Create Something{" "}
          <span className="text-[var(--accent-gold)] italic">Beautiful</span>
        </h2>

        <p className="mx-auto mt-5 max-w-md leading-7 text-muted">
          Book your wedding or event with Ramp Studio
        </p>

        <div className="mt-10">
          <Button as={Link} href="/booking" variant="outline">
            Book Appointment
          </Button>
        </div>
      </section>
    </Reveal>
  );
}
