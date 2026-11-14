import { describe, expect, it } from "vitest";
import { deliveryCents, isLahore } from "@/lib/delivery";

const rates = { lahore: 200, other: 350, freeThreshold: 5000 };

describe("delivery charges", () => {
  it("recognises Lahore in different spellings", () => {
    expect(isLahore("Lahore")).toBe(true);
    expect(isLahore("  lahore ")).toBe(true);
    expect(isLahore("LHR")).toBe(true);
    expect(isLahore("Karachi")).toBe(false);
    expect(isLahore("Lahore Cantt")).toBe(false);
  });

  it("charges the Lahore rate in Lahore and the other rate elsewhere", () => {
    expect(deliveryCents(100000, "Lahore", rates)).toBe(20000);
    expect(deliveryCents(100000, "Karachi", rates)).toBe(35000);
  });

  it("is free at or above the threshold", () => {
    expect(deliveryCents(500000, "Karachi", rates)).toBe(0);
    expect(deliveryCents(499999, "Karachi", rates)).toBe(35000);
  });

  it("never gives free delivery when the threshold is 0", () => {
    expect(deliveryCents(99999999, "Lahore", { ...rates, freeThreshold: 0 })).toBe(20000);
  });
});
