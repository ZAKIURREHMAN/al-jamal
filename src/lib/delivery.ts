/** Delivery maths shared by the server (authoritative) and the browser (preview). No server-only imports. */
export type DeliveryRates = { lahore: number; other: number; freeThreshold: number }; // rupees

export function isLahore(city: string): boolean {
  return /^\s*(lahore|lhr|لاہور)\s*$/i.test(city);
}

/** Delivery charge in paisa for a subtotal (paisa) and destination city. */
export function deliveryCents(subtotalCents: number, city: string, r: DeliveryRates): number {
  if (r.freeThreshold > 0 && subtotalCents >= r.freeThreshold * 100) return 0;
  return (isLahore(city) ? r.lahore : r.other) * 100;
}
