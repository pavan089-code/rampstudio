import assets from "./portfolio-assets.generated.json";

/** Only verified ImageKit URLs are included in the generated mapping. */
export function portfolioAsset(source: string): string {
  return (assets as Record<string, string>)[source] ?? source;
}
