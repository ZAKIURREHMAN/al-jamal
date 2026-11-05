import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const session = await requireAdmin();
  return ok({ email: session.email, name: session.name, role: session.role });
});
