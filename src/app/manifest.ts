import type { MetadataRoute } from "next";
import { storeConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: storeConfig.name,
    short_name: storeConfig.shortName,
    description: storeConfig.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#f8f0d9",
    theme_color: "#263f2c",
    icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
