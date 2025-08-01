"use client";

import { useState } from "react";
import axios from "axios";

export default function CheckDaoQuarantine() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    name: string;
    symbol: string;
    quarantined: boolean;
    address: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    // Let React commit "Checking..." before Axios starts
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const res = await axios.post("/api/dao/checkDaoQuarantineStatus", { input });
      setResult(res.data);
    } catch (err: any) {
      console.error("❌ Quarantine check failed:", err);
      setError(err.response?.data?.error || "Internal error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-yellow-400">Check Quarantine Status</h2>
      <input
        type="text"
        placeholder="e.g. 0x123... or name+symbol"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full px-3 py-2 mb-3 rounded bg-zinc-800 text-white border border-zinc-700"
      />
      <button
        onClick={handleCheck}
        disabled={loading || !input.trim()}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            Checking...
          </span>
        ) : (
          "Check Quarantine"
        )}
      </button>

      {result && (
        <div className="mt-4 text-sm">
          <p className="text-white">📦 Address: {result.address}</p>
          <p className="text-white">🔤 Name: {result.name}</p>
          <p className="text-white">🔣 Symbol: {result.symbol}</p>
          {result.quarantined ? (
            <p className="mt-2 text-red-400">❌ Token is QUARANTINED</p>
          ) : (
            <p className="mt-2 text-green-400">✅ Token is NOT Quarantined</p>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-yellow-400">{error}</p>}
    </div>
  );
}


