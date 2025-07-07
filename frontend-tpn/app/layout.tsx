// /app/layout.tsx

import './styles/globals.css';
import { Providers } from './providers';
import type { Metadata } from 'next';
import ClientWrapper from './components/ClientWrapper';
import { Analytics } from '@vercel/analytics/react';  // ✅ Added Analytics

export const metadata: Metadata = {
  title: 'Timeproof Network',
  description: 'The Trust Layer for Web3 Assets',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black font-sans">
        <Providers>
          <ClientWrapper>
            {children}
            <Analytics />  {/* ✅ Added Analytics */}
          </ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}



 









