import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_ALGORITHM, getJwtKey } from '@/lib/jwt-secret';

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

const PROTECTED_PAGE_PREFIXES = ['/dashboard', '/admin', '/onboarding'];
const PROTECTED_API_PREFIXES = [
  '/api/meals',
  '/api/users',
  '/api/workout-schedule',
  '/api/exercises',
  '/api/workout-sessions',
];

// The secret is resolved inside the request path, so a missing or weak value
// fails the request instead of breaking module evaluation. Importing it from
// lib/jwt-secret keeps this edge bundle free of the route-handler graph
// (Mongoose, models) and of any Node-only crypto dependency.
async function getTokenPayload(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtKey(), {
      algorithms: [JWT_ALGORITHM],
    });
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
      // Remember the page the athlete was trying to reach. /onboarding is
      // excluded: login already routes a fresh account there by its state.
      if (!pathname.startsWith('/onboarding')) {
        loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
      }
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

  // Onboarding page is for signed-in non-admins who haven't completed it yet.
  if (isPage && pathname.startsWith('/onboarding')) {
    if (payload.isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (payload.onboardedAt) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  const res = NextResponse.next();
  res.headers.set('x-auth-checked', '1');
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
    '/api/meals/:path*',
    '/api/users/:path*',
    '/api/workout-schedule/:path*',
    '/api/exercises/:path*',
    '/api/workout-sessions/:path*',
  ],
};
