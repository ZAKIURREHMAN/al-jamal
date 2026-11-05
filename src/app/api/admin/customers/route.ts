import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  const customers = await db.customer.findMany({
    where: q
      ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q.replace(/[\s-]/g, "") } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { orders: true } },
      orders: { select: { totalCents: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });
  return ok(
    customers.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      phone: c.phone,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      lastOrderAt: c.orders[0]?.createdAt ?? null,
      totalSpentCents: c.orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.totalCents, 0),
    })),
  );
});
