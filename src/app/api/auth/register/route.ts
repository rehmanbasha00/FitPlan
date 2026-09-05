import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { createSession, createUser, normalizePhone, toPublicUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/mailer';

const hashOtp = (code: string) => createHash('sha256').update(code).digest('hex');

type RegisterBody = {
  action?: 'send-otp' | 'verify';
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
  channel?: 'phone' | 'email';
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RegisterBody;
  const channel: 'phone' | 'email' = body.channel === 'email' ? 'email' : 'phone';
  const phone = normalizePhone(body.phone || '');
  const email = (body.email || '').trim().toLowerCase();

  if (!body.name?.trim() || !email || !body.password || !phone) {
    return NextResponse.json({ message: 'Name, email, password and phone number are required' }, { status: 400 });
  }
  if (!/^\+?[1-9]\d{9,14}$/.test(phone)) {
    return NextResponse.json({ message: 'Enter a valid phone number with country code' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'Enter a valid email address' }, { status: 400 });
  }
  if (body.password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
  }
  if (await prisma.user.findUnique({ where: { phone } })) {
    return NextResponse.json({ message: 'An account with this phone number already exists' }, { status: 409 });
  }

  // The OTP is always tied to whichever channel the user picked to verify —
  // phone number (SMS) or Gmail/email address.
  const target = channel === 'email' ? email : phone;

  if (body.action === 'send-otp') {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await prisma.otpChallenge.deleteMany({ where: { phone: target, channel } });
    await prisma.otpChallenge.create({
      data: { id: randomUUID(), phone: target, channel, codeHash: hashOtp(code), expiresAt: new Date(Date.now() + 300000) }
    });

    if (channel === 'phone') {
      const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM_PHONE;
      if (sid && token && from) {
        const auth = Buffer.from(`${sid}:${token}`).toString('base64');
        const form = new URLSearchParams({ To: phone, From: from, Body: `Your Fitplan verification code is ${code}. It expires in 5 minutes.` });
        const sms = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: 'POST',
          headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form
        });
        if (!sms.ok) return NextResponse.json({ message: 'Could not send OTP' }, { status: 502 });
        return NextResponse.json({ message: 'OTP sent to your phone.' });
      }
    } else {
      try {
        const result = await sendOtpEmail(email, code);
        if (result.configured) {
          if (!result.sent) return NextResponse.json({ message: 'Could not send OTP email' }, { status: 502 });
          return NextResponse.json({ message: 'OTP sent to your email.' });
        }
      } catch {
        return NextResponse.json({ message: 'Could not send OTP email' }, { status: 502 });
      }
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: channel === 'email' ? 'Email verification is not configured.' : 'SMS verification is not configured.' }, { status: 503 });
    }
    return NextResponse.json({ message: 'OTP generated for development.', devOtp: code });
  }

  const challenge = await prisma.otpChallenge.findFirst({ where: { phone: target, channel }, orderBy: { createdAt: 'desc' } });
  if (!challenge || challenge.expiresAt < new Date()) {
    return NextResponse.json({ message: 'OTP expired. Request a new OTP.' }, { status: 400 });
  }
  if (challenge.attempts >= 5) {
    return NextResponse.json({ message: 'Too many OTP attempts.' }, { status: 429 });
  }
  await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
  if (!body.otp || hashOtp(body.otp.trim()) !== challenge.codeHash) {
    return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
  }

  const user = await createUser(body.name.trim(), email, body.password, phone);
  await prisma.otpChallenge.delete({ where: { id: challenge.id } });
  const sid = await createSession(user.id);
  const res = NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  res.cookies.set(SESSION_COOKIE_NAME, sid, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 604800, secure: process.env.NODE_ENV === 'production' });
  return res;
}
