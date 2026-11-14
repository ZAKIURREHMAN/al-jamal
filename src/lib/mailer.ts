import nodemailer from "nodemailer";
import { logger } from "./logger";

/**
 * Optional email notifications. Active only when SMTP_HOST, SMTP_USER and SMTP_PASS are set
 * (for Gmail: smtp.gmail.com, port 465, and an App Password). Without them this is a no-op.
 */
export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (!mailConfigured() || !to) return false;
  try {
    const port = Number(process.env.SMTP_PORT ?? 465);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({ from: process.env.SMTP_FROM ?? `Al Jamal Store <${process.env.SMTP_USER}>`, to, subject, text });
    return true;
  } catch (e) {
    logger.error("Email notification failed", e);
    return false;
  }
}
