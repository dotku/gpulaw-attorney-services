import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit, safeErrorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 60, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string } };

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        role: true,
        clientProfile: { select: { id: true } },
        lawyerProfile: { select: { id: true } },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ cases: [] });
    }

    // Build where clause based on role
    const where: Record<string, unknown> = {};
    if (dbUser.role === 'CLIENT' && dbUser.clientProfile) {
      where.clientId = dbUser.clientProfile.id;
    } else if (dbUser.role === 'LAWYER' && dbUser.lawyerProfile) {
      where.lawyerId = dbUser.lawyerProfile.id;
    }
    // FIRM_ADMIN / PLATFORM_ADMIN see all consultations

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        category: { select: { key: true, nameEn: true } },
        client: { select: { firstName: true, lastName: true } },
        lawyer: { select: { firstName: true, lastName: true } },
      },
    });

    const cases = consultations.map((c) => ({
      id: c.id,
      title: c.clientDescription.slice(0, 80) || 'Untitled',
      clientName: c.client
        ? `${c.client.firstName || ''} ${c.client.lastName || ''}`.trim()
        : 'Unknown',
      lawyerName: c.lawyer
        ? `${c.lawyer.firstName || ''} ${c.lawyer.lastName || ''}`.trim()
        : null,
      category: c.category?.key || 'GENERAL',
      categoryName: c.category?.nameEn || '',
      status: c.status,
      type: c.type,
      description: c.clientDescription,
      urgencyLevel: c.urgencyLevel,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ cases });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch cases');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string } };

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        clientProfile: { select: { id: true } },
      },
    });

    if (!dbUser?.clientProfile) {
      return NextResponse.json(
        { error: 'Client profile required to create a case' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { categoryId, description, urgencyLevel } = body;

    if (!categoryId || !description) {
      return NextResponse.json(
        { error: 'Category and description are required' },
        { status: 400 }
      );
    }

    const consultation = await prisma.consultation.create({
      data: {
        clientId: dbUser.clientProfile.id,
        categoryId,
        clientDescription: description,
        urgencyLevel: urgencyLevel || 'medium',
        type: 'AI_CHAT',
        status: 'AI_CHAT_ACTIVE',
      },
      include: {
        category: { select: { key: true, nameEn: true } },
      },
    });

    return NextResponse.json(
      {
        case: {
          id: consultation.id,
          title: consultation.clientDescription.slice(0, 80),
          category: consultation.category?.key,
          status: consultation.status,
          description: consultation.clientDescription,
          createdAt: consultation.createdAt.toISOString(),
          updatedAt: consultation.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return safeErrorResponse(error, 'Failed to create case');
  }
}
