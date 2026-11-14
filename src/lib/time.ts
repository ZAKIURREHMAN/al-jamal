/** All customer- and admin-facing times are shown in Pakistan Standard Time, whatever the server's timezone. */
export const STORE_TZ = "Asia/Karachi";

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", timeZone: STORE_TZ });
}

export function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: STORE_TZ });
}

/** Calendar parts (YYYY, MM, DD) of a moment in Pakistan time. */
export function pktParts(d: Date = new Date()): { yyyy: string; mm: string; dd: string } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: STORE_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { yyyy: get("year"), mm: get("month"), dd: get("day") };
}

/** YYYY-MM-DD for a moment in Pakistan time. */
export function pktDateKey(d: Date = new Date()): string {
  const { yyyy, mm, dd } = pktParts(d);
  return `${yyyy}-${mm}-${dd}`;
}

/** The UTC instant at which the given Pakistan calendar day starts (PKT is UTC+5, no DST). */
export function pktDayStart(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00+05:00`);
}
