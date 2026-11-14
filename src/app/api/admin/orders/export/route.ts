import { handle } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { ordersCsv } from "@/lib/orders";
import { audit } from "@/lib/audit";
import { pktDateKey } from "@/lib/time";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const session = await requireAdmin();
  const csv = await ordersCsv();
  await audit(session, "export", "order", null, "Exported orders to CSV");
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="al-jamal-orders-${pktDateKey()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
