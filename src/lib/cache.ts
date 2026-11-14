import { revalidateTag } from "next/cache";

export const TAGS = { products: "products", reviews: "reviews", settings: "settings" } as const;

/** Invalidate cached data immediately (no stale window) — prices, stock and settings must never be stale after an edit. */
export function invalidate(...tags: (keyof typeof TAGS)[]) {
  for (const t of tags) {
    try {
      revalidateTag(TAGS[t], { expire: 0 });
    } catch {
      // Outside a request scope (scripts/tests) there is no cache to invalidate.
    }
  }
}
