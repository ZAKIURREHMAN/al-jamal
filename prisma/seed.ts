import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const rs = (rupees: number) => rupees * 100;

const products = [
  {
    slug: "classic-cow-desi-ghee",
    name: "Classic Cow Desi Ghee",
    shortDescription: "Golden, aromatic ghee slow-cooked from fresh cow's milk butter.",
    description:
      "Our Classic Cow Desi Ghee is made the way it has been made in Punjabi homes for generations. Fresh cow's milk is cultured into dahi, churned into makkhan, and then slow-simmered in small batches until the milk solids turn a gentle brown and release that unmistakable nutty aroma.\n\nThe result is a grainy, golden ghee with a clean, rich flavour that makes everyday dal, parathas, halwa and biryani taste like home. Nothing is added and nothing is taken away — just milk, time and patience.",
    isFeatured: true,
    sortOrder: 1,
    image: "classic-cow",
    variants: [
      { label: "500g", weightGrams: 500, priceRupees: 1450, stock: 40, sku: "AJ-COW-500" },
      { label: "1kg", weightGrams: 1000, priceRupees: 2800, stock: 60, sku: "AJ-COW-1000" },
      { label: "2kg", weightGrams: 2000, priceRupees: 5400, stock: 25, sku: "AJ-COW-2000" },
    ],
  },
  {
    slug: "premium-buffalo-desi-ghee",
    name: "Premium Buffalo Desi Ghee",
    shortDescription: "Rich, creamy-white ghee from buffalo milk with a deep, full-bodied flavour.",
    description:
      "Buffalo milk is prized across Pakistan for its richness, and our Premium Buffalo Desi Ghee captures all of it. Made from cultured buffalo butter and clarified slowly over a low flame, it sets to a smooth, creamy-white ghee with a bold, satisfying flavour.\n\nIt is the ghee of choice for traditional sweets, rich gravies and anyone who grew up with the taste of village ghee. Prepared in small batches and packed fresh.",
    isFeatured: true,
    sortOrder: 2,
    image: "premium-buffalo",
    variants: [
      { label: "500g", weightGrams: 500, priceRupees: 1550, stock: 35, sku: "AJ-BUF-500" },
      { label: "1kg", weightGrams: 1000, priceRupees: 2950, stock: 50, sku: "AJ-BUF-1000" },
      { label: "2kg", weightGrams: 2000, priceRupees: 5700, stock: 20, sku: "AJ-BUF-2000" },
    ],
  },
  {
    slug: "bilona-hand-churned-desi-ghee",
    name: "Bilona Hand-Churned Desi Ghee",
    shortDescription: "Our most traditional ghee, churned by hand from curd using the bilona method.",
    description:
      "The bilona method is the oldest way of making ghee. Instead of separating cream with a machine, whole milk is set into curd, then churned by hand with a wooden bilona to draw out the butter. That butter is then slow-cooked into ghee.\n\nIt takes far more milk and far more time, which is why true bilona ghee is rare. Ours is made in very small batches with a distinctly grainy texture and a delicate, fragrant taste. A ghee for people who notice the difference.",
    isFeatured: true,
    sortOrder: 3,
    image: "bilona",
    variants: [
      { label: "500g", weightGrams: 500, priceRupees: 2200, stock: 15, sku: "AJ-BIL-500" },
      { label: "1kg", weightGrams: 1000, priceRupees: 4200, stock: 18, sku: "AJ-BIL-1000" },
    ],
  },
  {
    slug: "family-pack-cow-desi-ghee",
    name: "Family Pack Cow Desi Ghee",
    shortDescription: "The same Classic Cow Desi Ghee in a generous family-size tin.",
    description:
      "For homes that cook with ghee every day, our Family Pack brings the Classic Cow Desi Ghee in a larger, better-value tin. Same milk, same slow cooking, same golden colour and aroma — just more of it.\n\nSealed fresh at our facility and shipped in a sturdy tin that keeps the ghee protected during delivery.",
    isFeatured: false,
    sortOrder: 4,
    image: "family-pack",
    variants: [
      { label: "2.5kg", weightGrams: 2500, priceRupees: 6500, stock: 12, sku: "AJ-FAM-2500" },
      { label: "5kg", weightGrams: 5000, priceRupees: 12500, stock: 8, sku: "AJ-FAM-5000" },
    ],
  },
  {
    slug: "desi-ghee-gift-jar",
    name: "Desi Ghee Gift Jar",
    shortDescription: "Classic Cow Desi Ghee in a handsome glass jar, boxed and ready to gift.",
    description:
      "Ghee has always been a gift of warmth and good wishes. Our Gift Jar presents the Classic Cow Desi Ghee in a thick glass jar with a wooden lid, packed in a kraft gift box with a hand-tied ribbon.\n\nA thoughtful choice for weddings, Eid, housewarmings or simply to say thank you.",
    isFeatured: false,
    sortOrder: 5,
    image: "gift-jar",
    variants: [
      { label: "500g", weightGrams: 500, priceRupees: 1950, stock: 20, sku: "AJ-GIFT-500" },
      { label: "1kg", weightGrams: 1000, priceRupees: 3400, stock: 10, sku: "AJ-GIFT-1000" },
    ],
  },
];

/**
 * First-run seed. It never overwrites anything:
 *  - the admin account is created only when no user exists (your password is never reset);
 *  - sample products are created only when the catalogue is completely empty
 *    (edits and deletions made in the admin are never undone).
 */
async function main() {
  const userCount = await db.user.count();
  if (userCount === 0) {
    const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!password || password.length < 10) throw new Error("Set ADMIN_PASSWORD (at least 10 characters) to create the first admin account");
    await db.user.create({ data: { email, name: "Store Admin", passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" } });
    console.log(`Admin user created: ${email}`);
  } else {
    console.log("Admin user already exists — left unchanged");
  }

  const productCount = await db.product.count();
  if (productCount > 0) {
    console.log(`Catalogue already has ${productCount} product(s) — sample products not re-seeded`);
    return;
  }

  for (const p of products) {
    const { variants, image, ...data } = p;
    const product = await db.product.create({ data: { ...data } });
    await db.productVariant.createMany({
      data: variants.map((v, i) => ({ productId: product.id, label: v.label, weightGrams: v.weightGrams, priceCents: rs(v.priceRupees), stock: v.stock, sku: v.sku, sortOrder: i })),
    });
    await db.productImage.createMany({
      data: [
        { productId: product.id, url: `/products/${image}.webp`, alt: `Al Jamal ${p.name} — pure desi ghee jar`, sortOrder: 0 },
        { productId: product.id, url: `/products/${image}-detail.webp`, alt: `Close-up of the grainy golden texture of Al Jamal ${p.name}`, sortOrder: 1 },
      ],
    });
    console.log(`Product created: ${p.name}`);
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
