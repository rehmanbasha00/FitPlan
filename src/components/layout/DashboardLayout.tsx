'use client';

import { PropsWithChildren, useEffect } from 'react';
import Header from './Header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, status]);

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
