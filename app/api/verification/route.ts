import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit } from '@/lib/api-auth';

// Demo data for verification status
const demoVerification = {
  id: 'lp-1',
  userId: 'demo-user',
  firstName: '',
  lastName: '',
  barNumber: '',
  barState: '',
  yearsExperience: 0,
  status: 'PENDING_VERIFICATION',
  verificationNotes: null,
  approvedAt: null,
  documents: [] as Array<{
    id: string;
    type: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    isVerified: boolean;
  }>,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// In-memory store for demo — keyed per user to avoid cross-user data leakage
// TODO: Replace with Prisma queries when DB integration is complete
const userVerifications = new Map<string, typeof demoVerification>();

function getVerification(userId: string) {
  if (!userVerifications.has(userId)) {
    userVerifications.set(userId, { ...demoVerification, userId });
  }
  return userVerifications.get(userId)!;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 60, 60_000);
  if (rateLimited) return rateLimited;

  const verification = getVerification(auth.user.sub);
  return NextResponse.json({ verification });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { barNumber, barState, yearsExperience, firstName, lastName, documents } = body;

    if (!barNumber || !barState) {
      return NextResponse.json(
        { error: 'Bar number and bar state are required' },
        { status: 400 }
      );
    }

    // Update verification profile (per-user)
    const verification = getVerification(auth.user.sub);
    verification.firstName = firstName || verification.firstName;
    verification.lastName = lastName || verification.lastName;
    verification.barNumber = barNumber;
    verification.barState = barState;
    verification.yearsExperience = yearsExperience || 0;
    verification.status = 'PENDING_VERIFICATION';
    verification.updatedAt = new Date().toISOString();

    // Add document metadata (no actual file upload — storage coming soon)
    if (documents && Array.isArray(documents)) {
      const newDocs = documents.map((doc: { type: string; fileName: string; fileSize: number; mimeType: string }) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: doc.type,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: new Date().toISOString(),
        isVerified: false,
      }));
      verification.documents = [...verification.documents, ...newDocs];
    }

    return NextResponse.json({ verification }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit verification' },
      { status: 500 }
    );
  }
}
