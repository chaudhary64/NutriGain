import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Single source of truth for the JWT secret.
 * Throws immediately if JWT_SECRET is missing so auth never silently
 * falls back to a predictable default.
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

const TOKEN_COOKIE = 'token';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/** Sign a session JWT for the given user. */
export function signToken(user) {
  return jwt.sign(
    {
      userId: user.id ?? user._id?.toString(),
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      name: user.name,
      onboardedAt: user.onboardedAt ? user.onboardedAt.toString() : null,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

/** Cookie options shared by login / register / logout. */
export function tokenCookieOptions(maxAgeSeconds = TOKEN_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeSeconds,
    path: '/',
  };
}

/**
 * Verify the request's JWT cookie. Pure token verification — no DB call.
 * Returns { authenticated, user } and never throws.
 *
 * NOTE: deliberately not exported. Route handlers should use withAuth(),
 * and the edge proxy verifies tokens independently with `jose`.
 */
function verifyAuth(request) {
  try {
    const token = request.cookies.get(TOKEN_COOKIE)?.value;

    if (!token) {
      return { authenticated: false, user: null };
    }

    const decoded = jwt.verify(token, getJwtSecret());

    return {
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        isAdmin: decoded.isAdmin,
      },
    };
  } catch {
    return { authenticated: false, user: null };
  }
}

/**
 * Wrap a route handler with authentication.
 *
 *   export const GET = withAuth(async (request, user) => { ... });
 *   export const POST = withAuth(handler, { admin: true });
 *
 * The wrapped handler receives (request, user, routeContext) and only runs
 * for authorized callers; unauthenticated requests get a 401, non-admins
 * on admin handlers a 403, and uncaught handler errors a logged 500.
 */
export function withAuth(handler, { admin = false } = {}) {
  return async (request, routeContext) => {
    const auth = verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (admin && !auth.user.isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    try {
      return await handler(request, auth.user, routeContext);
    } catch (error) {
      console.error('[API] Unhandled error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
