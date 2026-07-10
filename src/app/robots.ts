import type { MetadataRoute } from "next";

const SITE_URL = "https://www.rampstudio.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/portfolio", "/booking", "/contact", "/events"],
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
