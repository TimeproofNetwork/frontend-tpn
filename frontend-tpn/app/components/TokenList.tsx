"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import TokenRegistryAbi from "../../abi/TokenRegistry.json";

const TPN_TOKEN = process.env.NEXT_PUBLIC_TPN_TOKEN as `0x${string}`;
const BADGE_NFT = process.env.NEXT_PUBLIC_BADGE_NFT as `0x${string}`;
const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!;

type TokenMetadata = {
  name: string;
  symbol: string;
  tokenAddress: string;
  registeredBy: string;
  timestamp: number;
  trustLevel: number;
};

const trustLevelEmoji = ["⚫️", "🟡", "🟢", "🟣"]; // Final Locked: 0–3

function getTrustEmoji(level?: number): string {
  if (level === undefined || level === null || isNaN(level)) return "⚪";
  return trustLevelEmoji[level] ?? "⚪";
}

function getTrustLabel(level?: number): string {
  if (level === undefined || level === null || isNaN(level)) return "N/A";
  return `Level ${level}`;
}

export default function TokenList() {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredToken, setFilteredToken] = useState<TokenMetadata | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchLastTokens();
  }, []);

  const fetchLastTokens = async () => {
    setLoading(true);
    setFilteredToken(null);
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);
      const allTokens: any[] = await registry.getTokenLogbook();
      const lastFive = allTokens.slice(-5).reverse(); // newest first

      const metadata: TokenMetadata[] = await Promise.all(
        lastFive.map(async (info) => {
          const tokenAddress = info[2];
          const tokenInfo = await registry.getTokenInfo(tokenAddress);
          return {
            name: tokenInfo[0],
            symbol: tokenInfo[1],
            tokenAddress: tokenInfo[2],
            registeredBy: tokenInfo[3],
            timestamp: Number(tokenInfo[4]),
            trustLevel: Number(tokenInfo[7]), // Live accurate trust level
          };
        })
      );

      setTokens(metadata);
    } catch (err: any) {
      setError("❌ Failed to fetch tokens: " + (err.message || "Unknown error"));
    }
    setLoading(false);
  };

  const searchToken = async () => {
    setError(null);
    setFilteredToken(null);

    if (!search) return;
    setSearching(true);

    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);
      const tokenInfo = await registry.getTokenInfo(search);
      const metadata: TokenMetadata = {
        name: tokenInfo[0],
        symbol: tokenInfo[1],
        tokenAddress: tokenInfo[2],
        registeredBy: tokenInfo[3],
        timestamp: Number(tokenInfo[4]),
        trustLevel: Number(tokenInfo[7]),
      };
      setFilteredToken(metadata);
    } catch (err: any) {
      setError("❌ Token not found or invalid address.");
    }

    setSearching(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white bg-black rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-center flex items-center gap-2">
          🧾 Recent Token Registry
        </h2>
        <button
          onClick={fetchLastTokens}
          title="Refresh"
          className="text-white text-sm hover:text-purple-300"
        >
          ♻️
        </button>
      </div>

      <div className="flex mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by token address..."
          className="flex-1 p-3 rounded bg-gray-900 border border-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={searchToken}
          disabled={searching}
          className={`${
            searching
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white font-semibold px-4 py-2 rounded`}
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-purple-400 text-sm">⏳ Loading latest tokens...</p>
      ) : filteredToken ? (
        <TokenCard token={filteredToken} />
      ) : tokens.length > 0 ? (
        tokens.map((t, i) => <TokenCard key={i} token={t} />)
      ) : (
        <p className="text-gray-400">No tokens found.</p>
      )}
    </div>
  );
}

function TokenCard({ token }: { token: TokenMetadata }) {
  const date = new Date(token.timestamp * 1000).toLocaleString();

  return (
    <div className="mb-4 p-4 bg-gray-900 border border-gray-700 rounded-md shadow">
      <div className="font-bold text-xl">
        {token.name.toUpperCase()} ({token.symbol})
      </div>
      <div className="text-sm mt-1">📦 Address: {token.tokenAddress}</div>
      <div className="text-sm mt-1">🧑 Creator: {token.registeredBy}</div>
      <div className="text-sm mt-1">📅 Registered: {date}</div>
      <div className="text-sm mt-1">
        🔒 Trust Level: {getTrustEmoji(token.trustLevel)} {getTrustLabel(token.trustLevel)}
      </div>
    </div>
  );
}



















