import { NextRequest, NextResponse } from 'next/server';
import { destroySession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) destroySession(sessionId);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
