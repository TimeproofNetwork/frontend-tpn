"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";


interface TokenEntry {
  name: string;
  symbol: string;
  address: string;
  creator: string;
  timestamp: string;
  trustLevel: number;
  daoBanned?: boolean;         // ✅ ADD THIS
  quarantined?: boolean;       // ✅ ADD THIS
}

const trustLevelEmoji = ["⚫️", "🟡", "🟢", "🟣"];

export default function DAOCreatorTokens() {
  const [creator, setCreator] = useState("");
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [banInput, setBanInput] = useState("");
  const [quarantineInput, setQuarantineInput] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [limit, setLimit] = useState(50);
  const [daoBanResult, setDaoBanResult] = useState("");
  const [quarantineResult, setQuarantineResult] = useState("");
  const [daoBanLoading, setDaoBanLoading] = useState(false);
  const [quarantineLoading, setQuarantineLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferStatus, setTransferStatus] = useState("");
  const { isConnected, address: senderAddress } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // or a tiny skeleton


  const handleSearch = async () => {
    if (!ethers.utils.isAddress(creator)) {
      alert("Invalid creator address");
      return;
    }
    setLoading(true);
    setTokens([]);
    try {
      const res = await fetch(`/api/dao/getTokensByCreator?creator=${creator}`);
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch {
      console.error("❌ Failed to fetch tokens.");
    } finally {
      setLoading(false);
    }
  };

  const checkDaoBan = async () => {
  try {
    setDaoBanLoading(true);
    setDaoBanResult(""); // optional: clear previous
    const res = await fetch("/api/dao/checkDaoBanStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: banInput }),
    });
    const data = await res.json();
    setDaoBanResult(data.banned ? "Yes" : "No");
  } catch {
    setDaoBanResult("Error");
  } finally {
    setDaoBanLoading(false);
  }
};

  const checkQuarantine = async () => {
  try {
    setQuarantineLoading(true);
    setQuarantineResult(""); // optional: clear previous
    const res = await fetch("/api/dao/checkDaoQuarantineStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: quarantineInput })
    });
    const data = await res.json();
    setQuarantineResult(data.quarantined ? "Yes" : "No");
  } catch {
    setQuarantineResult("Error");
  } finally {
    setQuarantineLoading(false);
  }
};

  const handleTransfer = async () => {
  if (!isConnected || !senderAddress) {
    setTransferStatus("❌ Please connect your wallet first.");
    return;
  }

  setTransferStatus("transferring");

  try {
    const res = await fetch(`/api/dao/transferTPN`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: transferAddress,
        amount: transferAmount,
        sender: senderAddress
      })
    });

    const data = await res.json();
    if (data.txHash) {
      setTransferStatus(`✅ Transfer successful! Hash: ${data.txHash}`);
    } else {
      setTransferStatus("❌ Transfer failed.");
    }
  } catch {
    setTransferStatus("❌ Transfer failed.");
  }
};

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-md w-full space-y-6">

      {/* Creator Tools header with emblem */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <img
            src="/emblem.png"
            alt="TPN"
            className="w-[1.15em] h-[1.15em] mr-2 align-middle"
          />
          Creator Tools
        </h3>
      </div>

      {/* 1. DAO Ban Check */}
      <div className="bg-black border border-gray-700 rounded p-4">
        <p className="text-red-400 font-semibold mb-2">Check DAO Ban Status</p>
        <input
          type="text"
          placeholder="Enter token address or name+symbol (e.g., orbitverse+ovr)"
          value={banInput}
          onChange={(e) => setBanInput(e.target.value)}
          className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-2 rounded mb-3 focus:outline-none"
        />
        <button
  onClick={checkDaoBan}
  disabled={daoBanLoading}
  className={`${
    daoBanLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
  } text-white font-semibold px-4 py-2 rounded`}
>
  {daoBanLoading ? "Checking..." : "Check Ban Status"}
</button>
        {daoBanResult && (
          <div className="mt-2 text-white">
            DAO Ban Status:{" "}
            <span
              className={
                daoBanResult === "Yes"
                  ? "text-red-500 font-bold"
                  : "text-green-400 font-bold"
              }
            >
              {daoBanResult}
            </span>
          </div>
        )}
      </div>

      {/* 2. Quarantine Check */}
      <div className="bg-black border border-gray-700 rounded p-4">
        <p className="text-yellow-400 font-semibold mb-2">Check Quarantine Status</p>
        <input
          type="text"
          placeholder="Enter token address or name+symbol (e.g., orbitverse+ovr)"
          value={quarantineInput}
          onChange={(e) => setQuarantineInput(e.target.value)}
          className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-2 rounded mb-3 focus:outline-none"
        />
        <button
  onClick={checkQuarantine}
  disabled={quarantineLoading}
  className={`${
    quarantineLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
  } text-white font-semibold px-4 py-2 rounded`}
>
  {quarantineLoading ? "Checking..." : "Check Quarantine"}
</button>
        {quarantineResult && (
          <div className="mt-2 text-white">
            Quarantine Status:{" "}
            <span
              className={
                quarantineResult === "Yes"
                  ? "text-yellow-400 font-bold"
                  : "text-green-400 font-bold"
              }
            >
              {quarantineResult}
            </span>
          </div>
        )}
      </div>

      {/* 3. Transfer TPN */}
<div className="bg-black border border-gray-700 rounded p-4">
  <p className="text-green-400 font-semibold mb-2">Transfer TPN</p>

  {/* Show connected wallet */}
  {isConnected && senderAddress && (
    <div className="text-gray-400 text-sm mb-3">
      Connected:{" "}
      <span className="text-white font-mono">
        {`${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`}
      </span>
    </div>
  )}

  {/* Recipient Address */}
  <input
    type="text"
    placeholder="Enter recipient wallet address"
    value={transferAddress}
    onChange={(e) => setTransferAddress(e.target.value)}
    className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-2 rounded mb-3 focus:outline-none"
  />

  {/* Amount Field */}
  <input
    type="number"
    placeholder="Enter amount"
    value={transferAmount}
    onChange={(e) => setTransferAmount(e.target.value)}
    className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-2 rounded mb-3 focus:outline-none"
  />

  <button
    onClick={handleTransfer}
    disabled={transferStatus === "transferring"}
    className={`${
      transferStatus === "transferring" ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
    } text-white font-semibold px-4 py-2 rounded`}
  >
    {transferStatus === "transferring" ? "Transferring..." : "Transfer TPN"}
  </button>

  {transferStatus && transferStatus !== "transferring" && (
    <div className="mt-2 text-green-400 font-semibold break-words whitespace-normal">
  {transferStatus}
</div>
  )}
</div>

      {/* 4. Creator Token Search */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          Tokens by Creator
        </h3>
        <select
          className="bg-black text-white border border-gray-700 px-2 py-1 rounded text-sm"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={5}>Show 5</option>
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter creator wallet address"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          className="w-full bg-black text-white border border-gray-700 px-4 py-2 rounded focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* 5. Token Result */}
      {tokens.length > 0 && (
        <>
          <div className="bg-black border border-gray-700 rounded p-4 text-white">
            <h3 className="font-semibold mb-2">
              Showing Last {limit} Tokens Registered by Creator
            </h3>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto text-sm">
            {tokens.slice(0, limit).map((t) => (
  <div
    key={t.address || `${t.name ?? "?"}:${t.symbol ?? "?"}:${t.timestamp ?? ""}`}
    className="w-full p-4 bg-black border border-gray-700 rounded-lg shadow-sm"
  >
                <p className="font-bold text-white">
                  {t.name} ({t.symbol})
                </p>
                <p className="text-gray-300 text-sm">
                  Address: {t.address || "N/A"}
                </p>
                <p className="text-gray-300 text-sm">
  🔒 Trust Level:{" "}
  {t.daoBanned || t.quarantined ? "⚫️ Level 0" : `${trustLevelEmoji[t.trustLevel] ?? "⚫️"} Level ${t.trustLevel}`}
</p>

{t.daoBanned && (
  <p className="text-red-400 text-sm">☠️ DAO Banned</p>
)}

{t.quarantined && (
  <p className="text-yellow-400 text-sm">🧪 Under Quarantine</p>
)}
                <p className="text-gray-400 text-sm">
  Registered:{" "}
  <span suppressHydrationWarning>
    {mounted && t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}
  </span>
</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}









