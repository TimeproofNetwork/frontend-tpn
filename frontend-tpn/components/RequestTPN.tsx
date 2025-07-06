// ✅ /frontend-tpn/components/RequestTPN.tsx (Production Fixed with Responder Link)

import { useState } from 'react';

export default function RequestTPN() {
  const [walletAddress, setWalletAddress] = useState('');

  const handleRequest = () => {
    if (!walletAddress.trim()) {
      alert('Please enter your wallet address before submitting.');
      return;
    }
    window.open('https://forms.gle/rHRYavX97yf48yKWA', '_blank');
  };

  return (
    <div className="bg-[#0D0D0D] border border-[#333333] rounded-2xl p-6 text-white shadow-lg mt-12">
      <h3 className="text-xl font-semibold mb-2">📝 Request 100 TPN for Testing</h3>
      <p className="text-[#CCCCCC] text-sm mb-4">
        Enter your Sepolia wallet address to request free TPN tokens for testing Timeproof Network — The Trust Layer for Web3 Assets.
      </p>

      <input
        type="text"
        placeholder="Your Sepolia wallet address"
        className="w-full p-3 rounded-xl bg-[#1A1A1A] text-white border border-[#333333] focus:outline-none focus:ring focus:ring-blue-600 mb-4"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />

      <button
        onClick={handleRequest}
        disabled={!walletAddress.trim()}
        className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🚀 Request TPN
      </button>

      <p className="mt-4 text-xs text-[#888888] text-center">
        🔒 <strong>TPN keeps your request private and secure.</strong><br />
        <img src="/emblem.png" alt="TPN Emblem" className="inline w-4 h-4 mr-1 ml-1" />
        <span className="text-white font-medium">Timeproof Network</span> — The Trust Layer for Web3 Assets.
      </p>
    </div>
  );
}


