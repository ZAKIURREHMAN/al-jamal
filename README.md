# Al Jamal — Premium Desi Ghee E-Commerce

A production-ready storefront and admin dashboard for selling pure desi ghee in Pakistan with Cash on Delivery.

**Stack:** Next.js 16 (App Router, Route Handlers as the REST backend) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 7 · PostgreSQL 17

## Features

**Storefront**
- Homepage: hero, featured products, why-choose, our story, customer reviews (admin-managed), how to use, FAQ, contact, footer
- Product listing and SEO-friendly product detail pages (`/products/[slug]`) with weight variants, stock status, quantity selector and JSON-LD
- Persistent cart (localStorage) that re-syncs prices and stock from the server
- Cash-on-Delivery checkout with client + server validation, unique order numbers (`AJ-YYMMDD-XXXXX`), confirmation page and order tracking (`/track`)

**Admin** (`/admin`, protected by JWT session cookie + proxy)
- Overview: order counts by status and sales totals
- Products: create/edit/delete, weights & prices, stock, image upload (re-encoded to WebP), featured/active flags
- Orders: search, filter, paginate, view details, status workflow (Pending → Confirmed → Processing → Shipped → Delivered, Cancelled restores stock)
- Customers: order history and contact details
- Reviews: add/approve/hide real customer reviews (nothing is fabricated)

**Backend guarantees**
- Prices and totals are always computed server-side from PostgreSQL; client-submitted prices are ignored
- Orders and stock decrements run in a single transaction with a stock-guarded atomic update (no overselling)
- Zod validation on every API input; consistent JSON error envelope; structured logging
- bcrypt password hashing, HttpOnly session cookies, rate limiting on login and order placement, security headers

## Run with Docker (recommended)

Everything (PostgreSQL + the app) runs in containers. Requires Docker Desktop.

```bash
docker compose up -d --build
```

- Store: http://localhost:3000 · Admin: http://localhost:3000/admin
- On every start the app container applies migrations (`prisma migrate deploy`) and runs the idempotent seed (admin user + sample products). Set `SEED_ON_START=false` to skip seeding.
- Data persists in the `db_data` volume; uploaded images in the `uploads` volume.
- Configure secrets by copying `.env.docker.example` to `.env.docker` and running `docker compose --env-file .env.docker up -d --build`.

Useful commands:

```bash
docker compose logs -f app        # app logs
docker compose down               # stop (keeps data)
docker compose down -v            # stop and delete database + uploads
docker compose exec db psql -U aljamal -d al_jamal   # open a SQL shell
```

**Database only** (run the app on the host with `npm run dev`):

```bash
docker compose -f docker-compose.dev.yml up -d
# .env: DATABASE_URL="postgresql://aljamal:aljamal_dev_password@localhost:5433/al_jamal?schema=public"
```

## Getting started (without Docker)

```bash
# 1. PostgreSQL (macOS / Homebrew)
brew install postgresql@17
brew services start postgresql@17
createdb al_jamal

# 2. Configure
cp .env.example .env     # set DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Install, migrate, seed
npm install
npm run db:migrate       # applies prisma/migrations (creates one if the schema changed)
npm run db:seed          # admin user + sample products
npm run images:build     # (optional) regenerate product/hero/OG images in /public

# 4. Run
npm run dev              # http://localhost:3000  — admin at /admin
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed admin + sample products (idempotent) |
| `npm run db:studio` | Prisma Studio |
| `npm run images:build` | Render brand product images with sharp |
| `npm run typecheck` / `lint` | Quality checks |

## Environment variables

| Name | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | ≥32-char secret for signing admin sessions |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by the seed to create the admin account |
| `NEXT_PUBLIC_SITE_URL` | Public URL for metadata, sitemap and Open Graph |
| `DELIVERY_CHARGE_PKR` | Flat delivery charge (default 250) |
| `FREE_DELIVERY_THRESHOLD_PKR` | Free delivery at/above this subtotal (default 5000, 0 disables) |
| `NEXT_PUBLIC_GA_ID` | Optional. Google Analytics 4 measurement ID (`G-…`); analytics is off when empty |
| `GOOGLE_SITE_VERIFICATION` | Optional. Google Search Console verification token |

## API overview

Public: `GET /api/products`, `GET /api/products/[slug]`, `GET /api/reviews`, `POST /api/orders`, `GET /api/orders/[orderNumber]`

Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`

Admin (session required): `/api/admin/products`, `/api/admin/products/[id]`, `/api/admin/upload`, `/api/admin/orders`, `/api/admin/orders/[id]`, `/api/admin/customers`, `/api/admin/customers/[id]`, `/api/admin/reviews`, `/api/admin/reviews/[id]`, `/api/admin/stats`

## Project layout

```
prisma/               schema, migrations, seed
scripts/              image generation
src/app/(store)/      storefront pages
src/app/admin/        admin dashboard pages
src/app/api/          REST route handlers
src/components/       ui primitives, store, home sections, admin
src/lib/              db, auth, validation, orders, products, config, rate limiting
src/store/cart.ts     client cart (zustand + localStorage)
src/proxy.ts          admin route guard
```

## SEO

Page metadata, canonicals, Open Graph and all JSON-LD (Organization, WebSite, Product/Offer, BreadcrumbList, FAQPage, Article) are built from helpers in `src/lib/seo.tsx`. FAQ and blog content live in `src/content/`; add an article there and the sitemap, schema and listing update automatically. The keyword map, content calendar and the external steps (domain, Search Console, GA4, Google Business Profile) are in [docs/seo-strategy.md](docs/seo-strategy.md). **Set `NEXT_PUBLIC_SITE_URL` to the real https domain before launch** — every canonical and sitemap URL derives from it.

## Production notes

- Set a strong `AUTH_SECRET` and change the admin password after first login (re-run the seed with new env values or update via SQL).
- Store contact details and social links live in `src/lib/config.ts`.
- Uploaded images are written to `public/uploads`; mount persistent storage or swap for object storage when deploying to ephemeral hosts.
- The in-memory rate limiter is per-instance; use Redis when running multiple instances.
