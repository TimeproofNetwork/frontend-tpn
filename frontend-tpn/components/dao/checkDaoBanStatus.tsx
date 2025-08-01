"use client";

import { useState } from "react";
import axios from "axios";

export default function CheckDaoBanStatus() {
  const [input, setInput] = useState("");
  const [banned, setBanned] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setLoading(true);
    setBanned(null);
    setError("");

    // Let React commit loading state before Axios fires
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const res = await axios.post("/api/dao/checkDaoBanStatus", { input });
      setBanned(res.data.banned);
    } catch (err: any) {
      console.error("❌ Ban check failed:", err);
      setError("Error checking ban status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-red-400">Check DAO Ban Status</h2>
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
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
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
          "Check Ban Status"
        )}
      </button>

      {banned === true && (
        <p className="mt-3 text-red-400">DAO Ban Status: <strong>Yes</strong></p>
      )}
      {banned === false && (
        <p className="mt-3 text-green-400">DAO Ban Status: <strong>No</strong></p>
      )}
      {error && <p className="mt-3 text-yellow-400">{error}</p>}
    </div>
  );
}


