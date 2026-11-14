/**
 * Static brand identity. Everything a store owner may want to change without a rebuild
 * (phone, email, address, delivery charges…) lives in the database — see src/lib/settings.ts.
 */
export const storeConfig = {
  name: "Al Jamal Desi Ghee",
  shortName: "Al Jamal",
  tagline: "Pure Desi Ghee, Made with Tradition.",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};
