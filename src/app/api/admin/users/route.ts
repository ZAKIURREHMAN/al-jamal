import { ApiError, handle, ok, readJson } from "@/lib/api";
import { hashPassword, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUserCreateSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireOwner();
  return ok(await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } }));
});

export const POST = handle(async (req: Request) => {
  const session = await requireOwner();
  const input = adminUserCreateSchema.parse(await readJson(req));
  const email = input.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) throw new ApiError(409, "A user with that email already exists");
  const user = await db.user.create({ data: { name: input.name, email, role: input.role, passwordHash: await hashPassword(input.password) }, select: { id: true, name: true, email: true, role: true } });
  await audit(session, "create", "user", user.id, `Added ${input.role.toLowerCase()} user ${email}`);
  return ok(user, { status: 201 });
});
