import { handle, ok, readJson } from "@/lib/api";
import { requireOwner, requireAdmin } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok(await getSettings());
});

export const PUT = handle(async (req: Request) => {
  const session = await requireOwner();
  const input = settingsSchema.parse(await readJson(req));
  const saved = await saveSettings(input);
  await audit(session, "update", "settings", null, `Updated store settings (delivery Lahore Rs.${input.deliveryLahore}, other Rs.${input.deliveryOther}, free over Rs.${input.freeDeliveryThreshold})`);
  return ok(saved);
});
