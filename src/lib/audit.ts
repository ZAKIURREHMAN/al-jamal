import { db } from "./db";
import { logger } from "./logger";
import type { SessionPayload } from "./session-token";

/** Record an admin action. Never throws: auditing must not break the action it describes. */
export async function audit(session: SessionPayload, action: string, entity: string, entityId: string | null, summary: string) {
  try {
    await db.auditLog.create({ data: { userId: session.sub, userEmail: session.email, action, entity, entityId, summary: summary.slice(0, 500) } });
  } catch (e) {
    logger.error("Failed to write audit log", e);
  }
}
