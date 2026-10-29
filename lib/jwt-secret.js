/**
 * The JWT signing secret, and the only algorithm the app accepts.
 *
 * Deliberately its own module: proxy.js runs at the edge and needs the secret,
 * but must not pull lib/auth.js into its bundle — that module imports Mongoose
 * and the User model, and used to import a Node-only JWT library as well.
 *
 * Read per request rather than captured at module scope, so a misconfigured
 * deployment fails loudly at request time instead of shipping a bad value.
 */

/** Pinned everywhere tokens are signed or verified. */
export const JWT_ALGORITHM = 'HS256';

/**
 * The raw secret. Throws when it is missing or weak, so auth never silently
 * falls back to a predictable value.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET is missing or too weak (min 32 chars). Set it in .env.local / your host env. Generate one with: openssl rand -base64 32'
    );
  }
  return secret;
}

/** The secret in the Uint8Array form `jose` takes. */
export function getJwtKey() {
  return new TextEncoder().encode(getJwtSecret());
}
