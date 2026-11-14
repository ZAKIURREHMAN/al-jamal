/**
 * End-to-end smoke test against a running stack.
 *   BASE_URL=http://localhost:3100 ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/smoke-test.mjs
 * (BASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD default to the values in .env.)
 * It places one real order and removes it again, restoring stock.
 */
import fs from "node:fs";

const env = Object.fromEntries(
  (fs.existsSync(".env") ? fs.readFileSync(".env", "utf8") : "").split("\n").filter((l) => /^[A-Z_]+=/.test(l)).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; }),
);
const BASE = process.env.BASE_URL ?? `http://localhost:${env.APP_PORT ?? 3000}`;
const EMAIL = process.env.ADMIN_EMAIL ?? env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD ?? env.ADMIN_PASSWORD;

let failed = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`); if (!ok) failed++; };
const json = async (res) => { try { return await res.json(); } catch { return {}; } };
const settle = () => new Promise((r) => setTimeout(r, 600)); // cache invalidation is flushed just after the response
const cookieOf = (res, name) => (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).find((c) => c.startsWith(`${name}=`));

// --- health and headers ---
let res = await fetch(`${BASE}/api/health`);
check("health endpoint reports ok", res.status === 200 && (await json(res)).status === "ok");
res = await fetch(`${BASE}/`);
const h = res.headers;
check("homepage loads", res.status === 200);
check("security headers present", Boolean(h.get("content-security-policy") && h.get("strict-transport-security") && h.get("x-frame-options")));
check("X-Powered-By removed", !h.get("x-powered-by"));
const html = await res.text();
check("canonical uses the production domain", /<link rel="canonical" href="https:\/\/al-jamal\.shop/.test(html), (html.match(/<link rel="canonical" href="([^"]*)"/) ?? [])[1]);

// --- catalogue ---
res = await fetch(`${BASE}/api/products`);
const products = (await json(res)).data ?? [];
check("products API returns the catalogue", res.status === 200 && products.length > 0, `${products.length} products`);
const variant = products.flatMap((p) => p.variants).find((v) => v.stock >= 2);
check("a purchasable variant exists", Boolean(variant));

// --- admin auth gate ---
check("admin API rejects anonymous requests", (await fetch(`${BASE}/api/admin/orders`)).status === 401);
res = await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
const session = cookieOf(res, "aj_admin_session");
check("admin login works", res.status === 200 && Boolean(session));
const admin = { cookie: session ?? "", "content-type": "application/json" };

// --- validation and honeypot ---
const order = { fullName: "Smoke Test", phone: "03451110000", addressLine: "Smoke test address, please ignore", city: "Lahore", items: [{ variantId: variant?.id, quantity: 1 }] };
check("invalid order is rejected", (await fetch(`${BASE}/api/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...order, phone: "123" }) })).status === 400);
check("honeypot blocks bots", (await fetch(`${BASE}/api/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...order, website: "http://spam" }) })).status === 400);
check("unknown variant is rejected", (await fetch(`${BASE}/api/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...order, items: [{ variantId: "nope", quantity: 1, priceCents: 1 }] }) })).status === 400);

// --- place an order ---
res = await fetch(`${BASE}/api/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(order) });
const placed = (await json(res)).data;
const access = cookieOf(res, "aj_my_orders");
check("order is placed", res.status === 201 && /^AJ-\d{6}-[A-Z0-9]{5}$/.test(placed?.orderNumber ?? ""), placed?.orderNumber);
check("server computed the total", placed?.totalCents === variant.priceCents + placed?.deliveryCents);

// --- order privacy ---
const anon = await (await fetch(`${BASE}/order/${placed.orderNumber}`)).text();
check("order page hides the address from strangers", !anon.includes("Smoke test address") && !anon.includes("03451110000"));
const owner = await (await fetch(`${BASE}/order/${placed.orderNumber}`, { headers: { cookie: access ?? "" } })).text();
check("order page shows details to the browser that ordered", owner.includes("Smoke test address"));
const lookup = await json(await fetch(`${BASE}/api/orders/${placed.orderNumber}`));
check("public order API returns no personal data", !JSON.stringify(lookup).includes("Smoke") && !JSON.stringify(lookup).includes("0345"));

// --- stock decremented, then admin cleans up ---
await settle();
const after = ((await json(await fetch(`${BASE}/api/products`))).data ?? []).flatMap((p) => p.variants).find((v) => v.id === variant.id);
check("stock decreased by one", after?.stock === variant.stock - 1, `${variant.stock} → ${after?.stock}`);
const list = (await json(await fetch(`${BASE}/api/admin/orders?q=${placed.orderNumber}`, { headers: admin }))).data;
const id = list?.orders?.[0]?.id;
check("admin can find the order", Boolean(id));
check("admin can delete the order", (await fetch(`${BASE}/api/admin/orders/${id}`, { method: "DELETE", headers: admin })).status === 200);
await settle();
const restored = ((await json(await fetch(`${BASE}/api/products`))).data ?? []).flatMap((p) => p.variants).find((v) => v.id === variant.id);
check("stock restored after deletion (cache invalidated)", restored?.stock === variant.stock, `${restored?.stock}`);

// --- rate limiting ---
let limited = false;
for (let i = 0; i < 25; i++) { if ((await fetch(`${BASE}/api/orders/AJ-000000-ZZZZ${i % 10}`)).status === 429) { limited = true; break; } }
check("order-number guessing is throttled", limited);

console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
