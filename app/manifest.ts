import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eidgah Times",
    short_name: "Eidgah Times",
    description: "Crowd-verified Eid prayer locations, times, and notes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#EFFFFF",
    theme_color: "#AAC3CA",
    orientation: "portrait-primary",
    icons: [
      // Browser tab favicon.
      { src: "/icon.svg", sizes: "16x16", type: "image/svg+xml", purpose: "any" },
      // High-DPI browser tabs.
      { src: "/icon.svg", sizes: "32x32", type: "image/svg+xml", purpose: "any" },
      // Windows shortcuts.
      { src: "/icon.svg", sizes: "48x48", type: "image/svg+xml", purpose: "any" },
      // Older Android devices.
      { src: "/icon.svg", sizes: "72x72", type: "image/svg+xml", purpose: "any" },
      // Older high-density Android devices.
      { src: "/icon.svg", sizes: "96x96", type: "image/svg+xml", purpose: "any" },
      // Chrome Web Store and compatible launchers.
      { src: "/icon.svg", sizes: "128x128", type: "image/svg+xml", purpose: "any" },
      // Recommended Android home-screen icon.
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      // Installation, splash screens, and app stores.
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      // Maskable installation icon for Android launchers.
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
