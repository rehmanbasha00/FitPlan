import { describe, expect, it, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as REGISTER } from '@/app/api/auth/register/route';
import { POST as LOGIN } from '@/app/api/auth/login/route';
import { POST as LOGOUT } from '@/app/api/auth/logout/route';
import { GET as ME } from '@/app/api/auth/me/route';
import { db } from '@/lib/serverStore';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

function withCookie(url: string, cookie?: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (cookie) headers.set('cookie', `${SESSION_COOKIE_NAME}=${cookie}`);
  return new NextRequest(url, { ...init, headers });
}

describe('/api/auth route handlers', () => {
  beforeEach(() => {
    db.users = [];
    db.sessions = {};
  });

  it('registers a new user and sets a session cookie', async () => {
    const res = await REGISTER(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Wendy Explorer', email: 'wendy@fitplan.app', password: 'secret123' })
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.email).toBe('wendy@fitplan.app');
    expect(res.cookies.get(SESSION_COOKIE_NAME)).toBeDefined();
  });

  it('rejects a duplicate email on registration', async () => {
    await REGISTER(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Wendy', email: 'wendy@fitplan.app', password: 'secret123' })
      })
    );
    const res = await REGISTER(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Wendy Two', email: 'wendy@fitplan.app', password: 'secret123' })
      })
    );
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials and rejects incorrect ones', async () => {
    await REGISTER(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Wendy', email: 'wendy@fitplan.app', password: 'secret123' })
      })
    );

    const badLogin = await LOGIN(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'wendy@fitplan.app', password: 'wrongpass' })
      })
    );
    expect(badLogin.status).toBe(401);

    const goodLogin = await LOGIN(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'wendy@fitplan.app', password: 'secret123' })
      })
    );
    expect(goodLogin.status).toBe(200);
  });

  it('returns the current user for a valid session and 401 otherwise', async () => {
    const registerRes = await REGISTER(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Wendy', email: 'wendy@fitplan.app', password: 'secret123' })
      })
    );
    const sessionId = registerRes.cookies.get(SESSION_COOKIE_NAME)?.value;

    const meAuthed = await ME(withCookie('http://localhost/api/auth/me', sessionId));
    expect(meAuthed.status).toBe(200);

    const meAnonymous = await ME(new NextRequest('http://localhost/api/auth/me'));
    expect(meAnonymous.status).toBe(401);
  });

  it('logs out and invalidates the session', async () => {
    const registerRes = await REGISTER(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Wendy', email: 'wendy@fitplan.app', password: 'secret123' })
      })
    );
    const sessionId = registerRes.cookies.get(SESSION_COOKIE_NAME)?.value;

    await LOGOUT(withCookie('http://localhost/api/auth/logout', sessionId, { method: 'POST' }));

    const meAfterLogout = await ME(withCookie('http://localhost/api/auth/me', sessionId));
    expect(meAfterLogout.status).toBe(401);
  });
});
