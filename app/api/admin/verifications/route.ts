import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit, safeErrorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role === 'PLATFORM_ADMIN' || user?.role === 'FIRM_ADMIN';
}

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 60, 60_000);
  if (rateLimited) return rateLimited;

  const isAdmin = auth.user.email ? await requireAdmin(auth.user.email) : false;
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  try {
    const pendingLawyers = await prisma.lawyerProfile.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
            isVerified: true,
          },
        },
      },
    });

    const lawyers = pendingLawyers.map((lp) => ({
      id: lp.id,
      userId: lp.userId,
      firstName: lp.firstName,
      lastName: lp.lastName,
      email: lp.user.email,
      barNumber: lp.barNumber,
      barState: lp.barState,
      yearsExperience: lp.yearsExperience,
      status: lp.status,
      documents: lp.documents.map((d) => ({
        id: d.id,
        type: d.type,
        fileName: d.fileName,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        uploadedAt: d.uploadedAt.toISOString(),
        isVerified: d.isVerified,
      })),
      createdAt: lp.createdAt.toISOString(),
    }));

    return NextResponse.json({ lawyers });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch verifications');
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  const isAdmin = auth.user.email ? await requireAdmin(auth.user.email) : false;
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { lawyerId, action, notes } = body;

    if (!lawyerId || !action) {
      return NextResponse.json(
        { error: 'Lawyer ID and action are required' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    const updated = await prisma.lawyerProfile.update({
      where: { id: lawyerId },
      data: {
        status: action,
        verificationNotes: notes || null,
        ...(action === 'APPROVED' && {
          approvedAt: new Date(),
          approvedBy: auth.user?.email || 'admin',
        }),
      },
      select: {
        id: true,
        status: true,
        verificationNotes: true,
        approvedAt: true,
        approvedBy: true,
      },
    });

    return NextResponse.json({
      result: {
        lawyerId: updated.id,
        status: updated.status,
        notes: updated.verificationNotes,
        reviewedAt: updated.approvedAt?.toISOString() || new Date().toISOString(),
        reviewedBy: updated.approvedBy || auth.user?.email || 'admin',
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to update verification status');
  }
}
