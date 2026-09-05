'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AuthShell from '@/components/layout/AuthShell';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error } = useAppSelector((s) => s.auth);
  const [step, setStep] = useState<1 | 2>(1);
  const [channel, setChannel] = useState<'phone' | 'email'>('phone');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  const otpTarget = channel === 'email' ? email : phone;

  const requestOtp = async () => {
    setFieldError(null);
    if (!name.trim() || !email.trim() || !phone.trim() || password.length < 6) { setFieldError('Fill all details. Password must be at least 6 characters.'); return; }
    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send-otp', name, email, phone, password, channel }) });
      const data = await res.json();
      if (!res.ok) { setFieldError(data.message ?? 'Could not send OTP'); return; }
      setDevOtp(data.devOtp ?? '');
      setStep(2);
    } finally { setSendingOtp(false); }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault(); setFieldError(null);
    const result = await dispatch(registerUser({ name, email, phone, password, otp, channel }));
    if (registerUser.fulfilled.match(result)) { router.push('/'); router.refresh(); }
  };

  return (
    <AuthShell>
      <div className="mb-6 text-center"><h1 className="text-xl font-bold text-ink">Create your account</h1><p className="mt-1 text-sm text-ink-soft">{step === 1 ? 'Add your details and choose how to verify.' : `Enter the OTP sent to ${otpTarget}`}</p></div>
        {step === 1 ? (
          <div className="space-y-4">
            <Input id="register-name" label="Full name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="register-email" type="email" label="Email (Gmail works too)" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="register-phone" type="tel" label="Phone number" autoComplete="tel" placeholder="+919876543210" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input id="register-password" type="password" label="Password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />

            <div>
              <p className="mb-1.5 text-xs font-bold text-ink-soft">Verify using</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="OTP verification channel">
                <button
                  type="button"
                  role="radio"
                  aria-checked={channel === 'phone'}
                  onClick={() => setChannel('phone')}
                  className={`focus-ring rounded-2xl border px-3 py-2 text-xs font-bold transition ${channel === 'phone' ? 'border-accent bg-accent-soft text-accent' : 'border-surface-shell text-ink-soft hover:bg-surface-muted'}`}
                >
                  📱 Phone OTP
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={channel === 'email'}
                  onClick={() => setChannel('email')}
                  className={`focus-ring rounded-2xl border px-3 py-2 text-xs font-bold transition ${channel === 'email' ? 'border-accent bg-accent-soft text-accent' : 'border-surface-shell text-ink-soft hover:bg-surface-muted'}`}
                >
                  ✉️ Gmail / Email OTP
                </button>
              </div>
            </div>

            {fieldError && <p role="alert" className="text-sm text-red-500">{fieldError}</p>}
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            <Button type="button" className="w-full" disabled={sendingOtp} onClick={requestOtp}>{sendingOtp ? 'Sending OTP…' : `Send OTP to ${channel === 'email' ? 'email' : 'phone'}`}</Button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <Input id="register-otp" inputMode="numeric" autoComplete="one-time-code" label="6-digit OTP" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
            {devOtp && <div className="rounded-2xl bg-accent-soft px-3 py-2 text-xs text-ink">Local development OTP: <strong>{devOtp}</strong></div>}
            {fieldError && <p role="alert" className="text-sm text-red-500">{fieldError}</p>}
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={status === 'loading'}>{status === 'loading' ? 'Creating account…' : 'Verify & create account'}</Button>
            <button type="button" className="w-full text-xs font-medium text-accent" onClick={() => setStep(1)}>← Change details</button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-ink-soft">Already have an account? <Link href="/login" className="focus-ring font-medium text-accent hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}
