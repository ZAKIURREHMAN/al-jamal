/** Prices are stored as integer paisa (1 PKR = 100 paisa) to avoid floating-point drift. */
export function formatPKR(cents: number): string {
  const rupees = Math.round(cents) / 100;
  return `Rs. ${rupees.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export function rupeesToCents(rupees: number): number {
  return Math.round(rupees * 100);
}

export function centsToRupees(cents: number): number {
  return cents / 100;
}
