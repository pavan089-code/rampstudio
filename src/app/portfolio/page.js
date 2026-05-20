import Gallery from "@/components/Gallery";

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-primary px-6 pt-32 text-white sm:px-8 md:px-16 md:pt-40">
      <div className="mx-auto mb-14 max-w-7xl border-b border-white/10 pb-12 md:mb-20 md:pb-16">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
              Portfolio
            </p>

            <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] sm:text-6xl md:text-8xl">
              Timeless Wedding Stories
            </h1>
          </div>

          <div className="md:col-span-4 md:pb-2">
            <p className="max-w-xl text-sm leading-7 text-muted sm:text-base md:ml-auto">
              A curated collection of cinematic wedding moments, intimate
              emotions, and elegant celebrations captured through the lens of
              Ramp Studio.
            </p>

            <div className="mt-8 flex gap-8 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.18em] text-white/55">
              <span>04 Stories</span>
              <span>Wedding / Editorial</span>
            </div>
          </div>
        </div>
      </div>

      <Gallery />
    </main>
  );
}
