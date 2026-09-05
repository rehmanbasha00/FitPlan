import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'fitplan | Trip Dashboard',
  description: 'Plan trips, manage your schedule and chat with your travel crew.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
