'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AuthShell from '@/components/layout/AuthShell';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';

function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      router.push(searchParams.get('next') ?? '/');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="login-email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id="login-password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">Sign in to plan your next trip.</p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="focus-ring font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
