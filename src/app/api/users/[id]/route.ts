import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession, SESSION_COOKIE_NAME, toPublicUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getUserFromSession(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!me) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  return NextResponse.json(toPublicUser(user));
}
