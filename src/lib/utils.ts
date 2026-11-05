export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  CONFIRMED: "bg-sky-100 text-sky-800 ring-sky-200",
  PROCESSING: "bg-violet-100 text-violet-800 ring-violet-200",
  SHIPPED: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  DELIVERED: "bg-green-100 text-green-800 ring-green-200",
  CANCELLED: "bg-red-100 text-red-800 ring-red-200",
};

/** Typed fetch helper for our JSON API envelope. Throws with the server's message on error. */
export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { message?: string; details?: unknown } };
  if (!res.ok) {
    const err = new Error(json.error?.message ?? `Request failed (${res.status})`) as Error & { details?: unknown; status?: number };
    err.details = json.error?.details;
    err.status = res.status;
    throw err;
  }
  return json.data as T;
}
