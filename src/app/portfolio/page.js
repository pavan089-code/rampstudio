import Gallery from "@/components/Gallery";

export default function PortfolioPage() {
  return (
    <main className="bg-primary min-h-screen text-white pt-32 px-6 md:px-16">

      {/* Heading */}
      <div className="mb-20 max-w-3xl">

        <p className="text-[var(--accent-gold)] tracking-[0.2em] text-sm uppercase mb-4">
          Portfolio
        </p>

        <h1 className="text-5xl md:text-7xl font-serif leading-tight">
          Timeless Wedding Stories
        </h1>

        <p className="text-muted mt-6 max-w-xl leading-relaxed">
          A curated collection of cinematic wedding moments,
          intimate emotions, and elegant celebrations captured
          through the lens of Ramp Studio.
        </p>

      </div>

      {/* Gallery */}
      <Gallery />

    </main>
  );
}