import { sendMail } from "./mailer";
import { formatPKR } from "./money";
import { formatDateTime } from "./time";
import { storeConfig } from "./config";
import type { StoreSettings } from "./settings";
import type { OrderWithDetails } from "./orders";

/** Plain-text order summary used for the owner email and the customer's WhatsApp message. */
export function orderSummaryText(order: OrderWithDetails): string {
  const lines = order.items.map((i) => `• ${i.productName} (${i.variantLabel}) × ${i.quantity} — ${formatPKR(i.lineTotalCents)}`);
  return [
    `Order ${order.orderNumber} — ${formatDateTime(order.createdAt)}`,
    "",
    ...lines,
    "",
    `Subtotal: ${formatPKR(order.subtotalCents)}`,
    `Delivery: ${order.deliveryCents === 0 ? "Free" : formatPKR(order.deliveryCents)}`,
    `Total (Cash on Delivery): ${formatPKR(order.totalCents)}`,
    "",
    `${order.fullName} — ${order.phone}`,
    `${order.addressLine}, ${order.city}`,
    ...(order.notes ? [`Notes: ${order.notes}`] : []),
  ].join("\n");
}

/** Email the store owner about a new order (no-op unless SMTP is configured). Never throws. */
export async function notifyNewOrder(order: OrderWithDetails, settings: StoreSettings) {
  await sendMail(
    settings.notifyEmail,
    `New order ${order.orderNumber} — ${formatPKR(order.totalCents)} — ${order.city}`,
    `${orderSummaryText(order)}\n\nManage: ${storeConfig.siteUrl}/admin/orders/${order.id}`,
  );
}

export async function notifyContactMessage(name: string, phone: string, message: string, settings: StoreSettings) {
  await sendMail(settings.notifyEmail, `Website message from ${name}`, `${name} — ${phone}\n\n${message}\n\nInbox: ${storeConfig.siteUrl}/admin/messages`);
}
