import { handle, ok } from "@/lib/api";
import { listPublicProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  const url = new URL(req.url);
  const featured = url.searchParams.get("featured") === "1";
  const products = await listPublicProducts({ featuredOnly: featured });
  return ok(products);
});
