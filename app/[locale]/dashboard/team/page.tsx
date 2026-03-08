import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import TeamContent from './TeamContent';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string | null;
  joinedAt: string;
};

export default async function TeamPage() {
  let members: TeamMember[] = [];

  try {
    const session = await auth0?.getSession();
    const email = session?.user?.email;

    if (email) {
      const currentUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true, lawyerProfile: { select: { firmId: true } } },
      });

      if (currentUser) {
        // Platform admin sees all users; firm admin sees firm members; others see firm colleagues
        let where: Record<string, unknown> = { deletedAt: null };

        if (currentUser.role === 'PLATFORM_ADMIN') {
          // See all users
        } else if (
          currentUser.role === 'FIRM_ADMIN' &&
          currentUser.lawyerProfile?.firmId
        ) {
          // See users in the same firm
          where = {
            ...where,
            OR: [
              { lawyerProfile: { firmId: currentUser.lawyerProfile.firmId } },
              { id: currentUser.id },
            ],
          };
        } else if (currentUser.lawyerProfile?.firmId) {
          where = {
            ...where,
            lawyerProfile: { firmId: currentUser.lawyerProfile.firmId },
          };
        } else {
          // Solo practitioner — just show themselves
          where = { ...where, id: currentUser.id };
        }

        const users = await prisma.user.findMany({
          where,
          orderBy: { createdAt: 'asc' },
          take: 100,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            image: true,
            createdAt: true,
          },
        });

        members = users.map((u) => ({
          id: u.id,
          name: u.name || u.email.split('@')[0],
          email: u.email,
          role: u.role,
          status: u.status,
          avatar: u.image,
          joinedAt: u.createdAt.toISOString(),
        }));
      }
    }
  } catch (error) {
    console.error('[Team] Error fetching team data:', error);
  }

  return <TeamContent initialMembers={members} />;
}
