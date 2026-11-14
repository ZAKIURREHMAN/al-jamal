import { describe, expect, it } from "vitest";
import { checkoutSchema, pkPhoneSchema, productInputSchema, manualSaleInputSchema, settingsSchema } from "@/lib/validation";

const validOrder = { fullName: "Ayesha Khan", phone: "0300 1234567", addressLine: "House 12, Street 5, DHA Phase 5", city: "Lahore", notes: "", items: [{ variantId: "v1", quantity: 2 }] };

describe("phone numbers", () => {
  it("normalises every accepted format to 03XXXXXXXXX", () => {
    for (const p of ["03001234567", "0300 1234567", "0300-1234567", "+923001234567", "923001234567", "+92 300 1234567"]) {
      expect(pkPhoneSchema.parse(p)).toBe("03001234567");
    }
  });
  it("rejects landlines, short numbers and junk", () => {
    for (const p of ["123", "04235761234", "0300123456", "abcdefghijk", ""]) expect(pkPhoneSchema.safeParse(p).success).toBe(false);
  });
});

describe("checkout", () => {
  it("accepts a valid order", () => {
    expect(checkoutSchema.safeParse(validOrder).success).toBe(true);
  });
  it("rejects an empty cart, a short address and absurd quantities", () => {
    expect(checkoutSchema.safeParse({ ...validOrder, items: [] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validOrder, addressLine: "short" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validOrder, items: [{ variantId: "v1", quantity: 0 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validOrder, items: [{ variantId: "v1", quantity: 500 }] }).success).toBe(false);
  });
  it("rejects a filled honeypot", () => {
    expect(checkoutSchema.safeParse({ ...validOrder, website: "http://spam.example" }).success).toBe(false);
  });
  it("ignores a client-supplied price", () => {
    const parsed = checkoutSchema.parse({ ...validOrder, items: [{ variantId: "v1", quantity: 1, priceCents: 1 }] });
    expect(parsed.items[0]).not.toHaveProperty("priceCents");
  });
});

describe("admin inputs", () => {
  it("requires a lowercase hyphenated slug and at least one weight", () => {
    const base = { name: "Cow Ghee", slug: "cow-ghee", shortDescription: "Golden ghee", description: "Slow cooked cow ghee.", variants: [{ label: "1kg", weightGrams: 1000, priceRupees: 2800, stock: 5 }], images: [] };
    expect(productInputSchema.safeParse(base).success).toBe(true);
    expect(productInputSchema.safeParse({ ...base, slug: "Cow Ghee" }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, variants: [] }).success).toBe(false);
  });
  it("requires a positive manual sale amount", () => {
    expect(manualSaleInputSchema.safeParse({ amountRupees: 0, description: "x" }).success).toBe(false);
    expect(manualSaleInputSchema.safeParse({ amountRupees: 2500, description: "1kg via WhatsApp" }).success).toBe(true);
  });
  it("validates store settings", () => {
    const s = { phone: "+92 303 7055259", whatsapp: "923037055259", email: "a@b.com", address: "Lahore", facebook: "", deliveryLahore: 200, deliveryOther: 300, freeDeliveryThreshold: 5000, lowStockThreshold: 5, notifyEmail: "a@b.com" };
    expect(settingsSchema.safeParse(s).success).toBe(true);
    expect(settingsSchema.safeParse({ ...s, whatsapp: "+92 303" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...s, deliveryLahore: -1 }).success).toBe(false);
  });
});
