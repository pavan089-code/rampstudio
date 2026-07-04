import Link from "next/link";

export const metadata = {
  title: "Private Events | Ramp Studio",
  description: "Private event microsites created by Ramp Studio.",
};

export default function EventsPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080706] px-5 text-center text-white">
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-gold)]">Ramp Studio</p>
        <h1 className="mt-5 font-serif text-5xl">Private event experiences</h1>
        <p className="mt-6 leading-7 text-white/50">Open the private link shared by your host to view an event microsite.</p>
        <Link href="/" className="link-underline mt-8 inline-block text-sm text-white/70">Return to Ramp Studio</Link>
      </div>
    </main>
  );
}
