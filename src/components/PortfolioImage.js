"use client";

import Image from "next/image";

// ImageKit delivers the responsive variant directly, avoiding Next's second
// optimization pass. Local fallbacks retain their existing URLs.
function imageKitLoader({ src, width, quality }) {
  if (!src.startsWith("https://ik.imagekit.io/")) return src;
  const url = new URL(src);
  url.searchParams.set("tr", `w-${width},c-at_max,q-${quality || 80},f-auto`);
  return url.toString();
}

export default function PortfolioImage({ alt, ...props }) {
  return <Image {...props} alt={alt} loader={imageKitLoader} />;
}
