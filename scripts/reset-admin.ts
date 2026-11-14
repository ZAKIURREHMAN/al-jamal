/**
 * Apply ADMIN_EMAIL and ADMIN_PASSWORD from .env to the administrator account (the oldest ADMIN user),
 * reactivate it and sign out all of its sessions. Use this if you are locked out or want to change the login.
 * Run: npm run admin:reset
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ADMIN_EMAIL in .env is not a valid email address");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD in .env must be at least 10 characters");

  const admin = await db.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
  const passwordHash = await bcrypt.hash(password, 12);
  if (!admin) {
    await db.user.create({ data: { email, name: "Store Admin", passwordHash, role: "ADMIN" } });
    console.log(`Created administrator ${email}`);
    return;
  }
  const clash = await db.user.findUnique({ where: { email } });
  if (clash && clash.id !== admin.id) throw new Error(`Another user already uses ${email}`);
  await db.user.update({ where: { id: admin.id }, data: { email, passwordHash, isActive: true, tokenVersion: { increment: 1 } } });
  console.log(`Administrator login is now ${email} (was ${admin.email}). Password set from ADMIN_PASSWORD. All sessions signed out.`);
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1); });
