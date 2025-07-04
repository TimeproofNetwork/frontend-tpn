"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import TokenRegistryAbi from "../../abi/TokenRegistry.json";

const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

type TokenMetadata = {
  name: string;
  symbol: string;
  tokenAddress: string;
  registeredBy: string;
  timestamp: number;
  trustLevel: number;
};

export default function TokenList() {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredToken, setFilteredToken] = useState<TokenMetadata | null>(null);

  useEffect(() => {
    fetchLastTokens();
  }, []);

  const fetchLastTokens = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/GqdudOelttJ2NcLiZ2TyF"
      );
      const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);

      const allTokens: any[] = await registry.getTokenLogbook();
      const lastFive = allTokens.slice(-5);

      const metadata: TokenMetadata[] = lastFive.map((info) => ({
        name: info.name,
        symbol: info.symbol,
        tokenAddress: info.tokenAddress,
        registeredBy: info.registeredBy,
        timestamp: info.timestamp.toNumber(),
        trustLevel: info.trustLevel,
      }));

      setTokens(metadata.reverse());
    } catch (err: any) {
      setError("❌ Failed to fetch tokens: " + (err.message || "Unknown error"));
    }
    setLoading(false);
  };

  const searchToken = async () => {
    setError(null);
    setFilteredToken(null);

    if (!search) return;

    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/GqdudOelttJ2NcLiZ2TyF"
      );
      const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);
      const [name, symbol, tokenAddr, creator, timestamp, trust] =
        await registry.getTokenInfo(search);

      setFilteredToken({
        name,
        symbol,
        tokenAddress: tokenAddr,
        registeredBy: creator,
        timestamp: timestamp.toNumber(),
        trustLevel: trust,
      });
    } catch (err: any) {
      setError("❌ Token not found or invalid address.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white bg-black rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">📜 Recent Token Registry</h2>

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
          className="bg-blue-600 hover:bg-blue-500 rounded px-4 text-white font-semibold"
        >
          Search
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
  const trustColor =
    token.trustLevel === 1
      ? "🟡"
      : token.trustLevel === 2
      ? "🟢"
      : token.trustLevel === 3
      ? "🟣"
      : "⚪️";

  return (
    <div className="mb-4 p-4 bg-gray-900 border border-gray-700 rounded-md shadow">
      <div className="font-bold text-xl">
        {token.name.toUpperCase()} ({token.symbol})
      </div>
      <div className="text-sm mt-1">📦 Address: {token.tokenAddress}</div>
      <div className="text-sm mt-1">🧑 Creator: {token.registeredBy}</div>
      <div className="text-sm mt-1">📅 Registered: {date}</div>
      <div className="text-sm mt-1">
        🔒 Trust Level: {trustColor} Level {token.trustLevel}
      </div>
    </div>
  );
}









