import { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store';

export function renderWithStore(ui: ReactElement, store: AppStore = makeStore()) {
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
