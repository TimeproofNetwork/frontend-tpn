'use client';

import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-black via-purple-900 to-black">
      <div className="flex items-center justify-center gap-4 mb-6">
        <Image
          src="/emblem.png"
          alt="Timeproof Network Red Blue Shield Emblem"
          width={64}
          height={64}
          priority
        />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">TIMEPROOF NETWORK</h1>
      </div>

      <h2 className="text-xl md:text-3xl font-light max-w-2xl">
        The Trust Layer for Web3 Assets
      </h2>

      <p className="mt-6 text-lg text-gray-300 max-w-xl">
        TPN authenticates token legitimacy using smart contract fingerprints, global bans,
        and badge verification (L1–L3). Protect your assets. Verify your chain.
      </p>

      <div className="mt-8">
        <ConnectButton />
      </div>
    </section>
  );
}

















