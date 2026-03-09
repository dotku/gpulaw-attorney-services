import { NextRequest, NextResponse } from 'next/server';
import { auth0, isAuth0Configured } from './auth0';
import { prisma } from './prisma';
import { hashApiKey } from './api-keys';

type AuthError = { error: NextResponse; user?: undefined };
type AuthSuccess = {
  error?: undefined;
  user: { sub: string; email?: string; name?: string | null; [key: string]: unknown };
  apiKeyId?: string;
  permissions?: string[];
  ip?: string;
  userAgent?: string;
};
export type AuthResult = AuthError | AuthSuccess;

/**
 * Verify the user is authenticated via Auth0 session or API key.
 * Supports: Bearer token (API key) or session cookie.
 */
export async function requireApiAuth(request: NextRequest): Promise<AuthResult> {
  // Check for Bearer token (API key auth)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer sk_live_')) {
    return authenticateWithApiKey(authHeader.slice(7), request);
  }

  // Fall back to Auth0 session
  if (!isAuth0Configured || !auth0) {
    return { error: NextResponse.json({ error: 'Service unavailable' }, { status: 503 }) };
  }

  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return {
      user: session.user,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    };
  } catch {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
}

/**
 * Authenticate request using an API key (Bearer token).
 */
async function authenticateWithApiKey(rawKey: string, request: NextRequest): Promise<AuthResult> {
  try {
    const keyHash = hashApiKey(rawKey);

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });

    if (!apiKey || apiKey.revokedAt) {
      return { error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }) };
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { error: NextResponse.json({ error: 'API key expired' }, { status: 401 }) };
    }

    // Update last used (fire-and-forget)
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    return {
      user: {
        sub: apiKey.user.id,
        email: apiKey.user.email,
        name: apiKey.user.name,
      },
      apiKeyId: apiKey.id,
      permissions: apiKey.permissions,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    };
  } catch {
    return { error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }) };
  }
}

/**
 * Return a safe error response that never leaks internal details.
 */
export function safeErrorResponse(error: unknown, fallbackMessage: string) {
  const statusMessages: Record<string, { status: number; message: string }> = {
    'Rate limit exceeded': { status: 429, message: 'Service is busy. Please try again later.' },
  };

  if (error instanceof Error) {
    const mapped = statusMessages[error.message];
    if (mapped) {
      return NextResponse.json(
        { success: false, error: mapped.message },
        { status: mapped.status }
      );
    }
  }

  console.error(`[API Error] ${fallbackMessage}:`, error instanceof Error ? error.message : 'Unknown error');

  return NextResponse.json(
    { success: false, error: fallbackMessage },
    { status: 500 }
  );
}

// ============================================
// Rate Limiting (DB-backed via Neon PostgreSQL)
// ============================================

// In-memory fallback when DB is unavailable
const memoryFallback = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiter backed by Neon PostgreSQL.
 * Falls back to in-memory if DB is unreachable.
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 20,
  windowMs: number = 60_000
): Promise<NextResponse | null> {
  const now = Date.now();
  const windowStart = new Date(now - windowMs);

  try {
    // Count recent requests from this user using raw SQL for performance
    const result = await prisma.auditLog.count({
      where: {
        userId: identifier,
        timestamp: { gte: windowStart },
      },
    });

    if (result >= maxRequests) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(windowMs / 1000)) } }
      );
    }

    return null;
  } catch {
    // DB unavailable — fall back to in-memory
    const entry = memoryFallback.get(identifier);

    if (!entry || now > entry.resetAt) {
      memoryFallback.set(identifier, { count: 1, resetAt: now + windowMs });
      return null;
    }

    entry.count++;
    if (entry.count > maxRequests) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) } }
      );
    }

    return null;
  }
}

/** Max request body size in bytes (500KB) */
const MAX_BODY_SIZE = 512_000;

/**
 * Parse and validate JSON body with size limit.
 */
export async function parseBody<T = Record<string, unknown>>(request: NextRequest): Promise<{ data?: T; error?: NextResponse }> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return { error: NextResponse.json({ error: 'Request body too large' }, { status: 413 }) };
  }

  try {
    const data = await request.json() as T;
    return { data };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) };
  }
}
