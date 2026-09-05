'use client';

import { PropsWithChildren, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store';

export default function Providers({ children }: PropsWithChildren) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
