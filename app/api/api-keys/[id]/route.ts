import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit, safeErrorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/api-keys/[id] — Revoke an API key.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string } };
    const { id } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: dbUser.id, revokedAt: null },
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to revoke API key');
  }
}

/**
 * PATCH /api/api-keys/[id] — Update API key name or permissions.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string } };
    const { id } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: dbUser.id, revokedAt: null },
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, permissions } = body;

    const updated = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(permissions !== undefined && { permissions }),
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      key: {
        ...updated,
        expiresAt: updated.expiresAt?.toISOString() || null,
        lastUsedAt: updated.lastUsedAt?.toISOString() || null,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to update API key');
  }
}
