import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit, safeErrorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { generateApiKey, MAX_KEYS_PER_USER, API_KEY_PERMISSIONS } from '@/lib/api-keys';

/**
 * GET /api/api-keys — List user's API keys (masked).
 */
export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 60, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string } };

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ keys: [] });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: dbUser.id, revokedAt: null },
      orderBy: { createdAt: 'desc' },
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
      keys: keys.map((k) => ({
        ...k,
        expiresAt: k.expiresAt?.toISOString() || null,
        lastUsedAt: k.lastUsedAt?.toISOString() || null,
        createdAt: k.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch API keys');
  }
}

/**
 * POST /api/api-keys — Create a new API key.
 * Returns the raw key ONCE (never stored in plaintext).
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 10, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string } };

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check key limit
    const existingCount = await prisma.apiKey.count({
      where: { userId: dbUser.id, revokedAt: null },
    });

    if (existingCount >= MAX_KEYS_PER_USER) {
      return NextResponse.json(
        { error: `Maximum ${MAX_KEYS_PER_USER} active API keys allowed` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, permissions, expiresInDays } = body;

    if (!name || typeof name !== 'string' || name.length > 100) {
      return NextResponse.json(
        { error: 'Name is required (max 100 characters)' },
        { status: 400 }
      );
    }

    // Validate permissions
    const validPermissions = (permissions || API_KEY_PERMISSIONS).filter(
      (p: string) => (API_KEY_PERMISSIONS as readonly string[]).includes(p)
    );

    const { rawKey, keyHash, keyPrefix } = generateApiKey();

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: dbUser.id,
        name,
        keyHash,
        keyPrefix,
        permissions: validPermissions,
        expiresAt,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        key: {
          ...apiKey,
          rawKey, // Only returned once at creation
          expiresAt: apiKey.expiresAt?.toISOString() || null,
          createdAt: apiKey.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return safeErrorResponse(error, 'Failed to create API key');
  }
}
