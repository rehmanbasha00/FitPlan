import { NextRequest, NextResponse } from 'next/server';

// Route protection lives here because Next.js middleware runs on the Edge
// runtime, which can't use the Node-only `crypto` APIs our session store
// uses (see src/lib/auth.ts). So middleware only checks that the session
// cookie is *present* and redirects to /login if it's missing; the actual
// session is verified against the in-memory store in Node route handlers
// (e.g. /api/auth/me) and in DashboardLayout on the client. This is a
// reasonable trade-off for a demo/mock-auth app — a production app would
// verify a signed JWT here instead.
const SESSION_COOKIE_NAME = 'fitplan_session';

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)']
};
