# Al Jamal — SEO, AEO & GEO Strategy

Last updated: 2026-11-05. Companion to the implementation in `src/lib/seo.tsx`, `src/content/` and the page metadata.

## 1. Keyword research and page mapping

Search intent for desi ghee in Pakistan splits three ways. Each primary keyword is owned by exactly one page to avoid cannibalisation.

| Intent | Keyword cluster | Owning page | Supporting pages |
| --- | --- | --- | --- |
| Transactional | pure desi ghee, desi ghee, best desi ghee in Pakistan | `/` (home) | `/products` |
| Transactional | buy desi ghee online, desi ghee price in Pakistan, cow ghee online, buffalo ghee online | `/products` | product pages |
| Transactional | pure cow ghee, cow desi ghee 1kg price | `/products/classic-cow-desi-ghee` | family pack, blog |
| Transactional | pure buffalo ghee, buffalo desi ghee online | `/products/premium-buffalo-desi-ghee` | blog |
| Transactional | bilona ghee, hand churned desi ghee | `/products/bilona-hand-churned-desi-ghee` | blog |
| Local | pure desi ghee in Lahore, best desi ghee in Lahore, desi ghee price in Lahore, desi ghee online delivery Lahore, pure cow/buffalo ghee in Lahore | `/desi-ghee-lahore` | home, contact |
| Informational | what is pure desi ghee, desi ghee meaning | `/blog/what-is-pure-desi-ghee` | home FAQ |
| Informational | cow ghee vs buffalo ghee, difference between cow and buffalo ghee | `/blog/cow-ghee-vs-buffalo-ghee` | product pages |
| Informational | how to identify pure desi ghee, asli desi ghee ki pehchan, ghee purity test at home | `/blog/how-to-identify-pure-desi-ghee` | |
| Informational | uses of desi ghee, how to use desi ghee in cooking | `/blog/uses-of-desi-ghee-in-cooking` | home "How to use" |
| Informational | how to store desi ghee, desi ghee shelf life | `/blog/how-to-store-desi-ghee` | FAQs |
| Commercial investigation | how to choose desi ghee, organic desi ghee, traditional desi ghee | `/blog/how-to-choose-quality-desi-ghee` | `/about` |
| Brand | al jamal desi ghee, al jamal ghee lahore | `/`, `/about` | |

Additional long-tail candidates for future content: "desi ghee 1kg price in Lahore", "ghee for wedding bulk order Lahore", "desi ghee vs banaspati", "ghee for parathas", "halwa with desi ghee". Verify volumes in Google Search Console (queries report) and Google Keyword Planner once the site has impressions; Urdu/Roman-Urdu variants ("asli desi ghee", "khalis desi ghee") are worth testing as H2s in blog posts.

Note on "organic": we do not hold an organic certification, so the word is used only in the keyword list for discovery and never as a product claim.

## 2. Content calendar (next 90 days)

Publish one guide every 2 to 3 weeks, each answering a question customers actually ask on WhatsApp:

1. Desi ghee vs banaspati: what the difference is and how to read a label.
2. Desi ghee for weddings and bulk orders in Lahore (ties to the Lahore page).
3. Three everyday paratha recipes with desi ghee.
4. Suji halwa with desi ghee, step by step.
5. Why desi ghee changes texture between summer and winter.
6. How we make bilona ghee (behind the scenes, photos from the kitchen).

Rules: original text, accurate, no health or nutritional claims, one H1, descriptive H2s, FAQ block at the end, link to one or two products and one existing guide. Add each new article to `src/content/blog.ts`; sitemap and schema update automatically.

## 3. Structured data in place

- Organization + WebSite on every page (root layout).
- Product with one Offer per weight (price, PKR, availability) on product pages.
- BreadcrumbList on shop, product, about, contact, Lahore and blog pages.
- FAQPage on the home page, product pages, the Lahore page and every article.
- Article on blog posts.
- LocalBusiness is intentionally not emitted: it needs a verifiable street address and opening hours. Add it to `organizationJsonLd()` (change `@type` to `["Organization","LocalBusiness"]` and add `address.streetAddress`, `openingHoursSpecification`) once a physical address is published.

Validate after deploy with https://search.google.com/test/rich-results and https://validator.schema.org.

## 4. Technical checklist (done in code)

- One canonical per page via `alternates.canonical`; sitemap and robots read the domain from `NEXT_PUBLIC_SITE_URL`.
- robots.txt disallows admin, API, cart, checkout, order and tracking pages; sitemap referenced.
- Cart, checkout, order and tracking pages are `noindex`.
- Lowercase hyphenated slugs enforced by validation; product slugs are editable in admin.
- 404 pages for products and articles; global not-found.
- Images: WebP, `next/image` with `sizes`, lazy loading by default, `priority` only on the LCP image, descriptive alt text from the database.
- Security headers, HTTPS cookies in production.

## 5. External actions required (cannot be done in code)

1. **Production domain — done in code.** `NEXT_PUBLIC_SITE_URL` is `https://al-jamal.shop`; canonicals, sitemap, robots and Open Graph use it, and `www.al-jamal.shop` redirects permanently to the bare domain. Remaining: point the DNS A records at the server and start with `docker compose --profile prod up -d --build`.
2. **Google Search Console.** Add the property, put the verification token in `GOOGLE_SITE_VERIFICATION`, submit `/sitemap.xml`, and check Coverage and Enhancements (Products, FAQs, Breadcrumbs).
3. **Google Analytics 4.** Create a property, set `NEXT_PUBLIC_GA_ID=G-XXXXXXX`. Mark "purchase" as a key event by sending an event from the order confirmation page once GA is live (see `src/app/(store)/order/[orderNumber]/page.tsx`).
4. **Google Business Profile.** Eligible if orders are fulfilled from a Lahore address (a delivery-area business can hide its street address). Use the exact name "Al Jamal Desi Ghee", phone +92 303 7055259, category "Dairy store" or "Food products supplier", service area Lahore, and link to the Lahore page.
5. **NAP consistency.** Use the same business name, phone and city on Facebook, Instagram, WhatsApp Business, Daraz (if listed), Foodpanda/pandamart (if listed), and local directories.
6. **Social profiles.** Replace the placeholder Facebook/Instagram URLs in `src/lib/config.ts`; they are emitted in Organization `sameAs` only when real.

## 6. Off-page and local SEO plan

- Citations: Pakistan business directories (Rozee/PakBiz style listings), Lahore food directories, and marketplace storefronts with a link back to the site.
- Backlinks worth earning: Pakistani food blogs and recipe sites (offer a guest post on identifying pure ghee), Lahore lifestyle publications, wedding planners and caterers (bulk supply partnerships), local grocery delivery apps (listing pages).
- Reviews: ask delivered customers on WhatsApp for a Google Business review and permission to publish it on the site (the admin review manager exists for this).
- Avoid: paid link schemes, directory spam, exact-match anchor text across many sites.

## 7. Measurement and reporting

Monthly, from Search Console and GA4:

- Impressions, clicks, average position for the keyword clusters above, segmented by Lahore vs rest of Pakistan.
- Indexed pages vs sitemap count; rich result status for Products and FAQs.
- Organic sessions → product views → add to cart → orders (GA4 events).
- Core Web Vitals (Search Console report, PageSpeed Insights for `/`, `/products` and one product page).
- Top landing blog posts and the products they send traffic to.
