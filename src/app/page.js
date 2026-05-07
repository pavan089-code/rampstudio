import Hero from "../sections/home/Hero";
import FeaturedWork from "../sections/home/FeaturedWork";
import CTA from "../sections/home/Cta.js"

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedWork />
      <CTA />
    </main>
  );
}