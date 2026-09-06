import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/auth';

/**
 * Route guard (Next.js 16 "proxy" — the replacement for middleware).
 *
 * Runs before matched requests and verifies the session JWT cookie
 * (signature only — no DB call) for:
 *   - /dashboard/*  pages  -> redirect to /login when unauthenticated
 *   - /admin/*      pages  -> redirect to /login; non-admins to /dashboard
 *   - sensitive APIs       -> 401 JSON
 *
 * API routes still perform their own authorization (role checks, ownership)
 * — this is the outer net, not the only check.
 */

const PROTECTED_PAGE_PREFIXES = ['/dashboard', '/admin'];
const PROTECTED_API_PREFIXES = [
  '/api/meals',
  '/api/users',
  '/api/workout-schedule',
  '/api/exercises',
];

// JWT_SECRET is read via getJwtSecret() per request so misconfiguration is
// caught at request time, not bundled as a static value at build time.
async function getTokenPayload(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isPage = PROTECTED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const payload = await getTokenPayload(request);

  // Unauthenticated: pages bounce to /login, APIs get a clean 401.
  if (!payload) {
    if (isPage) {
      const loginUrl = new URL('/login', request.url);
      const res = NextResponse.redirect(loginUrl);
      res.headers.set('x-auth-checked', '1');
      return res;
    }
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Admin pages: a logged-in non-admin gets bounced to their dashboard.
  if (isPage && pathname.startsWith('/admin') && !payload.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const res = NextResponse.next();
  res.headers.set('x-auth-checked', '1');
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/meals/:path*',
    '/api/users/:path*',
    '/api/workout-schedule/:path*',
    '/api/exercises/:path*',
  ],
};
