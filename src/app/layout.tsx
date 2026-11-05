import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { storeConfig } from "@/lib/config";
import { JsonLd, organizationJsonLd, SEO, websiteJsonLd } from "@/lib/seo";
import { Analytics } from "@/components/analytics";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(storeConfig.siteUrl),
  applicationName: SEO.siteName,
  title: {
    default: "Pure Desi Ghee in Pakistan | Al Jamal Cow & Buffalo Ghee",
    template: `%s | ${SEO.siteName}`,
  },
  description: SEO.defaultDescription,
  keywords: SEO.keywords,
  authors: [{ name: SEO.siteName }],
  creator: SEO.siteName,
  publisher: SEO.siteName,
  category: "food",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SEO.siteName,
    locale: SEO.locale,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SEO.siteName} — pure desi ghee` }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  formatDetection: { telephone: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-PK" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Analytics />
      </body>
    </html>
  );
}
