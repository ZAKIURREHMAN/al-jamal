import { describe, expect, it } from "vitest";
import { formatDateTime, pktDateKey, pktDayStart, pktParts } from "@/lib/time";
import { formatPKR, rupeesToCents } from "@/lib/money";
import { maskName, maskPhone } from "@/lib/order-access";

describe("Pakistan time", () => {
  it("uses the Pakistan calendar day, not UTC", () => {
    // 20:30 UTC on 1 Nov is 01:30 on 2 Nov in Pakistan
    const late = new Date("2026-11-01T20:30:00Z");
    expect(pktDateKey(late)).toBe("2026-11-02");
    expect(pktParts(late)).toEqual({ yyyy: "2026", mm: "11", dd: "02" });
  });
  it("starts the day at midnight PKT (19:00 UTC the day before)", () => {
    expect(pktDayStart("2026-11-02").toISOString()).toBe("2026-11-01T19:00:00.000Z");
  });
  it("formats times in PKT regardless of server timezone", () => {
    expect(formatDateTime("2026-11-01T09:24:00Z")).toMatch(/2:24\s?pm/i);
  });
});

describe("money", () => {
  it("stores rupees as paisa and formats without decimals", () => {
    expect(rupeesToCents(2800)).toBe(280000);
    expect(formatPKR(280000)).toBe("Rs. 2,800");
  });
});

describe("order privacy masks", () => {
  it("hides most of a name and phone", () => {
    expect(maskName("Ayesha Khan")).toBe("A•••••");
    expect(maskPhone("03001234567")).toBe("••••••••567");
  });
});
