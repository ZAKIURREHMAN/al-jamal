import type { MetadataRoute } from "next";
import { storeConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/cart", "/checkout", "/order", "/track"] }],
    sitemap: `${storeConfig.siteUrl}/sitemap.xml`,
  };
}
