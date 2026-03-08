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
        lawyerProfile: {
          include: {
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
        },
      },
    });

    if (!dbUser?.lawyerProfile) {
      return NextResponse.json({
        verification: {
          id: null,
          status: null,
          firstName: '',
          lastName: '',
          barNumber: '',
          barState: '',
          yearsExperience: 0,
          verificationNotes: null,
          approvedAt: null,
          documents: [],
        },
      });
    }

    const lp = dbUser.lawyerProfile;
    return NextResponse.json({
      verification: {
        id: lp.id,
        userId: lp.userId,
        firstName: lp.firstName,
        lastName: lp.lastName,
        barNumber: lp.barNumber,
        barState: lp.barState,
        yearsExperience: lp.yearsExperience,
        status: lp.status,
        verificationNotes: lp.verificationNotes,
        approvedAt: lp.approvedAt?.toISOString() || null,
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
        updatedAt: lp.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch verification');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string } };

    const body = await request.json();
    const { barNumber, barState, yearsExperience, firstName, lastName, documents } = body;

    if (!barNumber || !barState) {
      return NextResponse.json(
        { error: 'Bar number and bar state are required' },
        { status: 400 }
      );
    }

    // Find or create user
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        role: 'LAWYER',
      },
      update: {
        role: 'LAWYER',
      },
    });

    // Upsert lawyer profile
    const lawyerProfile = await prisma.lawyerProfile.upsert({
      where: { userId: dbUser.id },
      create: {
        userId: dbUser.id,
        firstName: firstName || '',
        lastName: lastName || '',
        barNumber,
        barState,
        barAdmissionDate: new Date(),
        yearsExperience: yearsExperience || 0,
        status: 'PENDING_VERIFICATION',
      },
      update: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        barNumber,
        barState,
        yearsExperience: yearsExperience || 0,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Add document metadata if provided
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        await prisma.lawyerDocument.create({
          data: {
            lawyerId: lawyerProfile.id,
            type: doc.type || 'OTHER',
            fileName: doc.fileName || 'unknown',
            fileUrl: doc.fileUrl || '',
            fileSize: doc.fileSize || null,
            mimeType: doc.mimeType || null,
          },
        });
      }
    }

    // Re-fetch with documents
    const updated = await prisma.lawyerProfile.findUnique({
      where: { id: lawyerProfile.id },
      include: {
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

    return NextResponse.json(
      {
        verification: {
          id: updated!.id,
          userId: updated!.userId,
          firstName: updated!.firstName,
          lastName: updated!.lastName,
          barNumber: updated!.barNumber,
          barState: updated!.barState,
          yearsExperience: updated!.yearsExperience,
          status: updated!.status,
          documents: updated!.documents.map((d) => ({
            id: d.id,
            type: d.type,
            fileName: d.fileName,
            fileSize: d.fileSize,
            mimeType: d.mimeType,
            uploadedAt: d.uploadedAt.toISOString(),
            isVerified: d.isVerified,
          })),
          createdAt: updated!.createdAt.toISOString(),
          updatedAt: updated!.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return safeErrorResponse(error, 'Failed to submit verification');
  }
}
