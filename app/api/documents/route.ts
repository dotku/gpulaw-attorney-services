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
        lawyerProfile: { select: { id: true } },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ documents: [] });
    }

    // Lawyers see their own documents; admins see all
    const where: Record<string, unknown> = {};
    if (dbUser.role === 'LAWYER' && dbUser.lawyerProfile) {
      where.lawyerId = dbUser.lawyerProfile.id;
    }

    const docs = await prisma.lawyerDocument.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      take: 50,
      include: {
        lawyer: {
          select: { firstName: true, lastName: true, user: { select: { email: true } } },
        },
      },
    });

    const documents = docs.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      isVerified: d.isVerified,
      verifiedAt: d.verifiedAt?.toISOString() || null,
      uploadedAt: d.uploadedAt.toISOString(),
      lawyer: d.lawyer
        ? `${d.lawyer.firstName} ${d.lawyer.lastName}`.trim()
        : null,
    }));

    return NextResponse.json({ documents });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch documents');
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
      select: { lawyerProfile: { select: { id: true } } },
    });

    if (!dbUser?.lawyerProfile) {
      return NextResponse.json(
        { error: 'Lawyer profile required to upload documents' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, fileName, fileUrl, fileSize, mimeType } = body;

    if (!type || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: 'Type, fileName, and fileUrl are required' },
        { status: 400 }
      );
    }

    const doc = await prisma.lawyerDocument.create({
      data: {
        lawyerId: dbUser.lawyerProfile.id,
        type,
        fileName,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
      },
    });

    return NextResponse.json(
      {
        document: {
          id: doc.id,
          type: doc.type,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          uploadedAt: doc.uploadedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return safeErrorResponse(error, 'Failed to create document');
  }
}
