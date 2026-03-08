import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role === 'PLATFORM_ADMIN' || user?.role === 'FIRM_ADMIN';
}

// Demo data for admin verification list
const demoPendingLawyers = [
  {
    id: 'lp-101',
    userId: 'user-101',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    barNumber: 'CA-123456',
    barState: 'CA',
    yearsExperience: 8,
    status: 'PENDING_VERIFICATION',
    documents: [
      {
        id: 'doc-1',
        type: 'BAR_CERTIFICATE',
        fileName: 'bar_license_ca.pdf',
        fileSize: 245000,
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: false,
      },
      {
        id: 'doc-2',
        type: 'MALPRACTICE_INSURANCE',
        fileName: 'insurance_cert.pdf',
        fileSize: 180000,
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: false,
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lp-102',
    userId: 'user-102',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'michael.r@example.com',
    barNumber: 'NY-789012',
    barState: 'NY',
    yearsExperience: 12,
    status: 'PENDING_VERIFICATION',
    documents: [
      {
        id: 'doc-3',
        type: 'BAR_CERTIFICATE',
        fileName: 'ny_bar_certificate.pdf',
        fileSize: 310000,
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: false,
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 60, 60_000);
  if (rateLimited) return rateLimited;

  const isAdmin = auth.user.email ? await requireAdmin(auth.user.email) : false;
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  return NextResponse.json({ lawyers: demoPendingLawyers });
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

    // TODO: Update database when Prisma is connected
    const result = {
      lawyerId,
      status: action,
      notes: notes || null,
      reviewedAt: new Date().toISOString(),
      reviewedBy: auth.user?.email || 'admin',
    };

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update verification status' },
      { status: 500 }
    );
  }
}
