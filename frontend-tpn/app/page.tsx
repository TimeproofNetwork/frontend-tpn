'use client';

import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { sepolia } from 'wagmi/chains';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import TokenList from '@/app/components/TokenList';
import TokenRegister from '@/app/components/TokenRegister';
import Hero from '@/app/components/Hero';
import SuggestionBox from '@/components/SuggestionBox';
import Link from 'next/link';
import Image from 'next/image';

const { chains, provider, webSocketProvider } = configureChains(
  [sepolia],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Timeproof Network',
  projectId: 'timeproof-123',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export default function Home() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <main className="min-h-screen bg-black text-white font-sans">
          <Hero />

          <div className="flex justify-center mt-6">
            <Link href="/intelligence" target="_blank">
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-black border border-gray-700 text-white font-semibold shadow-md hover:shadow-lg hover:bg-gray-900 transition">
                <Image src="/emblem.png" alt="TPN Emblem" width={20} height={20} />
                TPN Intelligence Suite
              </button>
            </Link>
          </div>

          <section className="bg-[#0b0e14] text-white py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold mb-8 flex items-center">
                <span role="img" aria-label="lock" className="mr-2">🔒</span>
                How TPN Protects You
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-semibold mb-2">Token Fingerprint</h4>
                  <p className="text-gray-400">
                    Each token's bytecode is hashed and verified on-chain to prevent clones and fake projects.
                  </p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-semibold mb-2">Global Ban List</h4>
                  <p className="text-gray-400">
                    Top 500 tokens (by market cap) are banned by name/symbol to stop impersonators instantly.
                  </p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-semibold mb-2">TPN Badges</h4>
                  <p className="text-gray-400">
                    Badges prove trust level: 🟡 Level 1 (Default), 🟢 Level 2 (Exchange Verified), 🟣 Level 3 (Exchange & Audit Verified).
                  </p>
                </div>
              </div>
            </div>
          </section>

          <TokenRegister />

          <TokenList />

          <SuggestionBox />
        </main>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
















