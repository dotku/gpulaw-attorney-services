import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Audit log & data retention — SOC 2 compliance.
 * - Deletes audit logs older than 365 days
 * - Deletes expired chat messages (based on expiresAt field)
 * Runs daily via Vercel Cron.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retentionDays = 365;
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  // Delete old audit logs
  const auditResult = await prisma.auditLog.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });

  // Delete expired chat messages
  const chatResult = await prisma.chatMessage.deleteMany({
    where: {
      expiresAt: { not: null, lt: new Date() },
    },
  });

  return NextResponse.json({
    ok: true,
    audit_logs_deleted: auditResult.count,
    expired_messages_deleted: chatResult.count,
    retention_days: retentionDays,
  });
}
