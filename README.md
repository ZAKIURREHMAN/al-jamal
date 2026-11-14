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

Everything (PostgreSQL, the app, nightly backups) runs in containers. Secrets live in `.env` (copy `.env.example` and fill in the `CHANGE_ME` values; the stack refuses to start with a missing or placeholder `AUTH_SECRET`).

```bash
docker compose up -d --build
```

- Store: `http://localhost:${APP_PORT}` · Admin: `/admin` (log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, then change the password in **Admin → My Account**).
- On start the app applies migrations and runs a **first-run seed**: it creates the admin account and sample products only on an empty database. It never overwrites products you edited or deleted, and never resets a password.
- Data lives in named volumes: `db_data` (database) and `uploads` (product images uploaded in the admin, served at `/uploads/...`).
- The database port is bound to `127.0.0.1` only.

```bash
docker compose logs -f app          # app logs
docker compose down                 # stop (keeps data)
npm run test:smoke                  # end-to-end check against the running stack
```

### Go live on al-jamal.shop

1. Point the DNS **A records** of `al-jamal.shop` and `www.al-jamal.shop` at your server, and open ports 80 and 443.
2. Copy the project and your `.env` to the server. Keep `NEXT_PUBLIC_SITE_URL="https://al-jamal.shop"`.
3. Start with the production profile, which adds Caddy (automatic HTTPS, `www` → bare domain redirect):

```bash
docker compose --profile prod up -d --build
```

4. In Google Search Console add the property, put the token in `GOOGLE_SITE_VERIFICATION`, and submit `https://al-jamal.shop/sitemap.xml`. Add `NEXT_PUBLIC_GA_ID` for Analytics. Rebuild after changing either.

### Backups

The `backup` service writes a compressed dump to `./backups` every 24 hours and keeps 14 days. Copy that folder off the server regularly. Restore with:

```bash
gunzip -c backups/<file>.sql.gz | docker compose exec -T db psql -U aljamal -d al_jamal
```

### Email alerts (optional)

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `.env` (for Gmail: `smtp.gmail.com`, `465`, your address and an App Password) to receive an email for every new order, contact message and review. The address is set in **Admin → Settings**.

## Getting started (without Docker)

```bash
cp .env.example .env     # point DATABASE_URL at your PostgreSQL
npm install
npm run db:migrate
npm run db:seed          # first-run only: admin + sample products
npm run dev
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
| `npm test` | Unit tests (vitest) |
| `npm run test:smoke` | End-to-end smoke test against a running stack |

## Environment variables

| Name | Description |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | Database container credentials and the localhost port |
| `DATABASE_URL` | Connection string used by `npm run dev`, Prisma CLI and scripts on the host |
| `AUTH_SECRET` | ≥32-char random secret that signs admin sessions and order-access cookies |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used once to create the first admin on an empty database |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (`https://al-jamal.shop`); baked in at build time |
| `APP_PORT` | Host port for the app container |
| `DELIVERY_CHARGE_PKR`, `FREE_DELIVERY_THRESHOLD_PKR` | Initial delivery defaults; afterwards edit them in Admin → Settings |
| `NEXT_PUBLIC_GA_ID`, `GOOGLE_SITE_VERIFICATION` | Optional analytics and Search Console |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Optional email alerts |

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
- Contact details, delivery charges and alert thresholds are edited in **Admin → Settings** (no rebuild).
- Uploaded images are stored in the `uploads` volume and served by `/uploads/[name]`.
- Rate limits are stored in PostgreSQL, so they survive restarts and are shared across instances.
- Order pages show personal details only to the browser that placed the order or after the matching phone number is entered.
- All times are shown in Pakistan time (Asia/Karachi).
