import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 60, 60_000);
  if (rateLimited) return rateLimited;

  const { id } = await params;

  // TODO: Replace with database query
  const mockCase = {
    id,
    title: 'Smith v. Johnson Partnership Dispute',
    clientName: 'John Smith',
    category: 'CIVIL_LITIGATION',
    status: 'IN_PROGRESS',
    description: 'Partnership dispute involving breach of fiduciary duty and misappropriation of partnership assets. Client seeks dissolution and accounting.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      {
        id: 'doc-1',
        title: 'Complaint Draft',
        type: 'COMPLAINT',
        status: 'DRAFT',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'doc-2',
        title: 'Partnership Agreement Analysis',
        type: 'LEGAL_OPINION',
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  return NextResponse.json({ case: mockCase });
}
