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
  const mockDocument = {
    id,
    title: 'Employment Contract - Acme Corporation',
    content: `# Employment Contract\n\n## Parties\n\nThis Employment Agreement ("Agreement") is entered into as of March 7, 2026, by and between:\n\n**Employer:** Acme Corporation, a Delaware corporation\n**Employee:** John Smith\n\n## Terms of Employment\n\n### 1. Position\nThe Employee shall serve as Senior Software Engineer, reporting to the VP of Engineering.\n\n### 2. Compensation\n- Base Salary: $150,000 per annum\n- Bonus: Up to 15% of base salary\n- Equity: 10,000 stock options\n\n### 3. Benefits\n- Health, dental, and vision insurance\n- 401(k) with 4% employer match\n- 20 days paid time off\n\n### 4. Confidentiality\nEmployee agrees to maintain strict confidentiality of all proprietary information.\n\n### 5. Term\nThis Agreement shall commence on March 15, 2026, and shall continue until terminated by either party with 30 days written notice.\n\n---\n\n*This document was generated with AI assistance and should be reviewed by a licensed attorney before use.*`,
    type: 'CONTRACT',
    status: 'DRAFT',
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    case: { id: 'case-2', title: 'Acme Corp Employment Matters' },
  };

  return NextResponse.json({ document: mockDocument });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  const { id } = await params;

  try {
    const body = await request.json();
    // TODO: Update in database
    return NextResponse.json({
      document: { id, ...body, updatedAt: new Date().toISOString() },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  const { id } = await params;
  // TODO: Delete from database
  return NextResponse.json({ deleted: true, id });
}
