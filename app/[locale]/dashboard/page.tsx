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

  try {
    const session = await auth0?.getSession();
    const email = session?.user?.email;

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          role: true,
          name: true,
          lawyerProfile: {
            select: { status: true },
          },
        },
      });

      if (user) {
        role = user.role as DashboardRole;
        userName = user.name || session?.user?.name || null;

        // Fetch lawyer verification status
        if (role === 'LAWYER' && user.lawyerProfile) {
          verificationStatus = user.lawyerProfile.status;
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
        // User authenticated via Auth0 but no DB record yet
        userName = session?.user?.name || null;
      }
    }
  } catch (error) {
    console.error('[Dashboard] Error fetching user data:', error);
    // Fall through with role = null to show profile prompt
  }

  return (
    <DashboardContent
      role={role}
      userName={userName}
      verificationStatus={verificationStatus}
      adminData={adminData}
    />
  );
}
