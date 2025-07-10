// /app/layout.tsx

import './styles/globals.css';
import { Providers } from './providers';
import type { Metadata } from 'next';
import ClientWrapper from './components/ClientWrapper';
import { Analytics } from '@vercel/analytics/react';  // ✅ Added Analytics

export const metadata: Metadata = {
  title: 'Timeproof Network — The Trust Layer for Web3 Assets',  // ✅ Updated Title
  description: 'Timeproof Network (TPN) protects Web3 assets through decentralized, permissionless, and autonomous trust scoring, fraud prevention, and real-time verification — without central control.',  // ✅ Updated Description
  openGraph: {
    title: 'Timeproof Network — The Trust Layer for Web3 Assets',
    description: 'Decentralized. Permissionless. Autonomous. Timeproof Network secures Web3 with real-time verification and badge authentication. Protect your assets. Verify your chain.',
    images: [
      {
        url: '/og-image.png',  // ✅ Add this image to /public folder
        width: 1200,
        height: 630,
        alt: 'Timeproof Network — The Trust Layer for Web3 Assets',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timeproof Network — The Trust Layer for Web3 Assets',
    description: 'Decentralized. Permissionless. Autonomous. Protect your assets. Verify your chain.',
    images: ['/og-image.png'],
  },
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




 









