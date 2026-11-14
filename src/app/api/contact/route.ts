import { after } from "next/server";
import { ApiError, handle, ok, readJson } from "@/lib/api";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { contactMessageSchema } from "@/lib/validation";
import { notifyContactMessage } from "@/lib/notifications";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const POST = handle(async (req: Request) => {
  const limit = await rateLimit(`contact:${clientIp(req)}`, 4, 60 * 60 * 1000);
  if (!limit.ok) throw new ApiError(429, "You've sent several messages already. Please WhatsApp us instead.");
  const raw = (await readJson(req)) as Record<string, unknown>;
  if (typeof raw?.website === "string" && raw.website.length > 0) return ok({ received: true }, { status: 201 });
  const input = contactMessageSchema.parse(raw);
  await db.contactMessage.create({ data: { name: input.name, phone: input.phone, message: input.message } });
  after(async () => notifyContactMessage(input.name, input.phone, input.message, await getSettings()));
  return ok({ received: true }, { status: 201 });
});
