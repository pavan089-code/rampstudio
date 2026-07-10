const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export type NormalizedYouTubeUrl = {
  videoId: string;
  embedUrl: string;
  originalUrl: string;
};

function cleanVideoId(value: string | null): string {
  if (!value) return "";
  const [candidate] = value.trim().split(/[?&#/]/);
  return YOUTUBE_ID_PATTERN.test(candidate) ? candidate : "";
}

export function normalizeYouTubeUrl(value: string): NormalizedYouTubeUrl | null {
  const originalUrl = value.trim();
  if (!originalUrl) return null;

  let url: URL;
  try {
    url = new URL(originalUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  let videoId = "";

  if (host === "youtube.com" || host === "m.youtube.com") {
    const [firstPath, secondPath] = url.pathname.split("/").filter(Boolean);
    if (firstPath === "watch") videoId = cleanVideoId(url.searchParams.get("v"));
    if (firstPath === "live" || firstPath === "embed") videoId = cleanVideoId(secondPath);
  }

  if (host === "youtu.be") {
    videoId = cleanVideoId(url.pathname.replace(/^\/+/, ""));
  }

  if (!videoId) return null;

  return {
    videoId,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    originalUrl,
  };
}
