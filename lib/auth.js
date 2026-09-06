import jwt from 'jsonwebtoken';

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
 */
export function verifyAuth(request) {
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

/** Throw-on-failure variant for API routes. */
export function requireAuth(request) {
  const auth = verifyAuth(request);
  if (!auth.authenticated) {
    throw new Error('Authentication required');
  }
  return auth.user;
}

/** Throw-on-failure admin variant for API routes. */
export function requireAdmin(request) {
  const user = requireAuth(request);
  if (!user.isAdmin) {
    throw new Error('Admin privileges required');
  }
  return user;
}
