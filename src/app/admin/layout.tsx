import type { ReactNode } from "react";

export const runtime = "nodejs";

export const metadata = {
  title: "Ramp Studio Admin CRM",
  description: "Booking and inquiry management for Ramp Studio.",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
