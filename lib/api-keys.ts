import { randomBytes, createHash } from 'crypto';

const KEY_PREFIX = 'sk_live_';

/**
 * Generate a new API key with a secure random value.
 * Returns both the raw key (shown once) and its hash (stored in DB).
 */
export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const random = randomBytes(32).toString('base64url');
  const rawKey = `${KEY_PREFIX}${random}`;
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = `${KEY_PREFIX}${random.slice(0, 8)}...`;
  return { rawKey, keyHash, keyPrefix };
}

/**
 * Hash an API key using SHA-256 for secure storage.
 */
export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Mask an API key for display (show prefix only).
 */
export function maskApiKey(keyPrefix: string): string {
  return keyPrefix;
}

/**
 * Available permission scopes for API keys.
 */
export const API_KEY_PERMISSIONS = [
  'chat',
  'research',
  'documents',
  'cases',
  'profile',
] as const;

export type ApiKeyPermission = (typeof API_KEY_PERMISSIONS)[number];

/**
 * Max API keys per user.
 */
export const MAX_KEYS_PER_USER = 10;
