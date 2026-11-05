import { handle, ok } from "@/lib/api";
import { listApprovedReviews } from "@/lib/products";

export const dynamic = "force-dynamic";

export const GET = handle(async () => ok(await listApprovedReviews(12)));
