import Hero from "@/sections/home/Hero";
import FeaturedWork from "@/sections/home/FeaturedWork";
import CTA from "@/sections/home/Cta.js"
import AboutStory from "@/sections/home/AboutStorySection";
import Testimonials from "@/sections/home/Testimonials";
import Services from "@/sections/home/Services";
import Faq from "@/sections/home/Faq";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedWork />
      <Services />
      <Testimonials />
      <AboutStory />
      <Faq />
      <CTA />
    </main>
  );
}