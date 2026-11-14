import { unstable_cache } from "next/cache";
import { db } from "./db";
import { TAGS, invalidate } from "./cache";
import { deliveryCents, type DeliveryRates } from "./delivery";

function intEnv(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && process.env[name] ? n : fallback;
}

/** Store settings editable from Admin → Settings. Values in the database override these defaults. */
export type StoreSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  /** Delivery charge inside Lahore, in rupees. */
  deliveryLahore: number;
  /** Delivery charge for every other city, in rupees. */
  deliveryOther: number;
  /** Orders at or above this subtotal (rupees) ship free. 0 disables free delivery. */
  freeDeliveryThreshold: number;
  /** Variants at or below this stock are flagged on the dashboard. */
  lowStockThreshold: number;
  /** Where new-order and contact-form emails are sent (needs SMTP configured). */
  notifyEmail: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  phone: "+92 303 7055259",
  whatsapp: "923037055259",
  email: "aljamalfoods@gmail.com",
  address: "Lahore, Punjab, Pakistan",
  facebook: "https://www.facebook.com/AlJamalfood",
  instagram: "https://www.instagram.com/aljamalfoods/",
  deliveryLahore: intEnv("DELIVERY_CHARGE_PKR", 250),
  deliveryOther: intEnv("DELIVERY_CHARGE_PKR", 250),
  freeDeliveryThreshold: intEnv("FREE_DELIVERY_THRESHOLD_PKR", 5000),
  lowStockThreshold: 5,
  notifyEmail: "aljamalfoods@gmail.com",
};

const NUMERIC: (keyof StoreSettings)[] = ["deliveryLahore", "deliveryOther", "freeDeliveryThreshold", "lowStockThreshold"];

async function load(): Promise<StoreSettings> {
  const rows = await db.setting.findMany();
  const out: Record<string, string | number> = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (!(r.key in DEFAULT_SETTINGS)) continue;
    out[r.key] = NUMERIC.includes(r.key as keyof StoreSettings) ? Number(r.value) : r.value;
  }
  return out as StoreSettings;
}

const cached = unstable_cache(load, ["store-settings"], { tags: [TAGS.settings], revalidate: 60 });

export async function getSettings(): Promise<StoreSettings> {
  try {
    return await cached();
  } catch {
    try {
      return await load(); // outside a request scope (scripts, tests)
    } catch {
      return DEFAULT_SETTINGS; // database unreachable (e.g. during an image build)
    }
  }
}

export async function saveSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  await db.$transaction(
    Object.entries(patch).map(([key, value]) =>
      db.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } }),
    ),
  );
  invalidate("settings");
  return load();
}

export function ratesOf(s: StoreSettings): DeliveryRates {
  return { lahore: s.deliveryLahore, other: s.deliveryOther, freeThreshold: s.freeDeliveryThreshold };
}

/** Delivery charge in paisa for a subtotal (paisa) and destination city. Server-authoritative. */
export function deliveryCentsFor(subtotalCents: number, city: string, s: StoreSettings): number {
  return deliveryCents(subtotalCents, city, ratesOf(s));
}
