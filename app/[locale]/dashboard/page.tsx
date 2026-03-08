import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import DashboardContent, { type DashboardRole } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  let role: DashboardRole = null;
  let userName: string | null = null;
  let verificationStatus: string | undefined;
  let adminData:
    | {
        userCount: number;
        pendingVerifications: number;
        totalLawyers: number;
        recentAuditLogs: Array<{
          id: string;
          action: string;
          userId: string;
          timestamp: string;
        }>;
      }
    | undefined;
  let lawyerData:
    | {
        clientCount: number;
        pendingConsultations: number;
        totalEarnings: number;
        recentConsultations: Array<{
          id: string;
          clientName: string;
          category: string;
          status: string;
          scheduledAt: string | null;
        }>;
      }
    | undefined;
  let clientData:
    | {
        consultationCount: number;
        documentCount: number;
        chatCount: number;
        upcomingCount: number;
        recentChats: Array<{
          id: string;
          category: string | null;
          summary: string | null;
          updatedAt: string;
        }>;
      }
    | undefined;

  try {
    const session = await auth0?.getSession();
    const email = session?.user?.email;

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          role: true,
          name: true,
          clientProfile: { select: { id: true } },
          lawyerProfile: { select: { id: true, status: true } },
        },
      });

      if (user) {
        role = user.role as DashboardRole;
        userName = user.name || session?.user?.name || null;

        // Fetch lawyer-specific data
        if (role === 'LAWYER' && user.lawyerProfile) {
          verificationStatus = user.lawyerProfile.status;

          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          const [clientCount, pendingCount, earningsResult, recentConsults] =
            await Promise.all([
              prisma.consultation.count({
                where: {
                  lawyerId: user.lawyerProfile.id,
                  status: { in: ['COMPLETED', 'IN_PROGRESS', 'SCHEDULED', 'CONFIRMED'] },
                },
              }),
              prisma.consultation.count({
                where: {
                  lawyerId: user.lawyerProfile.id,
                  status: { in: ['PENDING_BOOKING', 'SCHEDULED'] },
                },
              }),
              prisma.consultation.aggregate({
                where: {
                  lawyerId: user.lawyerProfile.id,
                  status: 'COMPLETED',
                  paymentStatus: 'paid',
                  updatedAt: { gte: monthStart },
                },
                _sum: { fee: true },
              }),
              prisma.consultation.findMany({
                where: { lawyerId: user.lawyerProfile.id },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                include: {
                  client: { select: { firstName: true, lastName: true } },
                  category: { select: { nameEn: true } },
                },
              }),
            ]);

          lawyerData = {
            clientCount,
            pendingConsultations: pendingCount,
            totalEarnings: earningsResult._sum.fee
              ? Number(earningsResult._sum.fee)
              : 0,
            recentConsultations: recentConsults.map((c) => ({
              id: c.id,
              clientName: c.client
                ? `${c.client.firstName || ''} ${c.client.lastName || ''}`.trim()
                : 'Unknown',
              category: c.category?.nameEn || 'General',
              status: c.status,
              scheduledAt: c.scheduledAt?.toISOString() || null,
            })),
          };
        }

        // Fetch client-specific data
        if (role === 'CLIENT' && user.clientProfile) {
          const [consultCount, chatCount, upcomingCount, recentChats] =
            await Promise.all([
              prisma.consultation.count({
                where: { clientId: user.clientProfile.id },
              }),
              prisma.chatSession.count({
                where: { clientId: user.clientProfile.id },
              }),
              prisma.consultation.count({
                where: {
                  clientId: user.clientProfile.id,
                  status: { in: ['SCHEDULED', 'CONFIRMED'] },
                  scheduledAt: { gte: new Date() },
                },
              }),
              prisma.chatSession.findMany({
                where: { clientId: user.clientProfile.id },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: {
                  id: true,
                  category: true,
                  summary: true,
                  updatedAt: true,
                },
              }),
            ]);

          clientData = {
            consultationCount: consultCount,
            documentCount: 0, // No client document model yet
            chatCount,
            upcomingCount,
            recentChats: recentChats.map((c) => ({
              id: c.id,
              category: c.category,
              summary: c.summary,
              updatedAt: c.updatedAt.toISOString(),
            })),
          };
        }

        // Fetch admin-specific data
        if (role === 'FIRM_ADMIN' || role === 'PLATFORM_ADMIN') {
          const [userCount, pendingVerifications, totalLawyers, recentLogs] =
            await Promise.all([
              prisma.user.count({ where: { deletedAt: null } }),
              prisma.lawyerProfile.count({
                where: { status: 'PENDING_VERIFICATION' },
              }),
              prisma.lawyerProfile.count({
                where: { status: { in: ['VERIFIED', 'APPROVED'] } },
              }),
              prisma.auditLog.findMany({
                orderBy: { timestamp: 'desc' },
                take: 10,
                select: {
                  id: true,
                  action: true,
                  userId: true,
                  timestamp: true,
                },
              }),
            ]);

          adminData = {
            userCount,
            pendingVerifications,
            totalLawyers,
            recentAuditLogs: recentLogs.map((log) => ({
              ...log,
              timestamp: log.timestamp.toISOString(),
            })),
          };
        }
      } else {
        userName = session?.user?.name || null;
      }
    }
  } catch (error) {
    console.error('[Dashboard] Error fetching user data:', error);
  }

  return (
    <DashboardContent
      role={role}
      userName={userName}
      verificationStatus={verificationStatus}
      adminData={adminData}
      lawyerData={lawyerData}
      clientData={clientData}
    />
  );
}
