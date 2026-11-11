function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const storeConfig = {
  name: "Al Jamal Desi Ghee",
  shortName: "Al Jamal",
  tagline: "Pure Desi Ghee, Made with Tradition.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Flat delivery charge in paisa. */
  deliveryCents: () => intEnv("DELIVERY_CHARGE_PKR", 250) * 100,
  /** Orders at or above this subtotal (paisa) ship free. 0 disables. */
  freeDeliveryThresholdCents: () => intEnv("FREE_DELIVERY_THRESHOLD_PKR", 5000) * 100,
  contact: {
    phone: "+92 303 7055259",
    whatsapp: "923037055259",
    email: "aljamal2031@gmail.com",
    address: "Lahore, Punjab, Pakistan",
  },
  social: {
    facebook: "https://www.facebook.com/AlJamalfood",
  },
};

export function computeDelivery(subtotalCents: number): number {
  const threshold = storeConfig.freeDeliveryThresholdCents();
  if (threshold > 0 && subtotalCents >= threshold) return 0;
  return storeConfig.deliveryCents();
}
