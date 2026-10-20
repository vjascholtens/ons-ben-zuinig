import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ons Ben Zuinig",
    short_name: "Ben Zuinig",
    description: "Bonnetjes, facturen en administratie op één plek.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f2",
    theme_color: "#163f36",
    lang: "nl-NL",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
