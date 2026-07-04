"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import CinematicGrain from "@/components/CinematicGrains";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import WhatsAppButton from "@/components/WhatsappButton";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isEventExperience = pathname?.startsWith("/events/");

  if (isAdmin || isEventExperience) {
    return <>{children}</>;
  }

  return (
    <>
      <Loader />
      <CinematicGrain />
      <PageTransition>
        <WhatsAppButton />
        <Navbar />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </PageTransition>
    </>
  );
}
