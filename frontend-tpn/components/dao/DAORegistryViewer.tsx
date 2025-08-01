"use client";

import { useEffect, useState } from "react";

interface TokenEntry {
  name: string;
  symbol: string;
  token: string;
  creator: string;
  timestamp: string;
  trustLevel: number;
  trustLevelDisplay: string;
  isDAOBanned: boolean;
}

export default function DAORegistryViewer() {
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dao/getRegistryTokens?limit=${limit}`);
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch {
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [limit]);

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <img
            src="/emblem.png"
            alt="TPN"
            className="w-[1.15em] h-[1.15em] mr-2 align-middle"
          />
          Recent Token Registry
        </h3>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="bg-black text-white border border-gray-600 px-2 py-1 rounded"
        >
          {[10, 20, 30, 40, 50, 75, 100].map((n) => (
            <option key={n} value={n}>{n} tokens</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">⏳ Loading tokens...</p>
      ) : tokens.length === 0 ? (
        <p className="text-sm text-gray-400">No tokens found.</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto text-sm">
          {tokens.map((t, idx) => (
            <div
              key={idx}
              className="p-3 bg-black border border-gray-700 rounded w-full"
            >
              <p><strong>{t.name}</strong> ({t.symbol})</p>
              <p>📦 Address: {t.token}</p>
              <p>🧑 Creator: {t.creator}</p>
              <p>📅 Registered: {new Date(t.timestamp).toLocaleString()}</p>
              <p>🔒 Trust Level: {t.trustLevelDisplay}</p>
              {t.isDAOBanned && (
                <p className="text-red-400">☠️ Caution — Token is DAO Banned.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

