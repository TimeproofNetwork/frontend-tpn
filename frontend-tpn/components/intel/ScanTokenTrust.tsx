"use client";
import { useState } from "react";

export default function TokenTrustScore() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!name || !symbol) {
      return alert("Enter both token name and symbol.");
    }

    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/scanTokenTrustScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, symbol }),
      });

      const data = await res.json();
      setOutput(data.output || "⚠️ No output returned.");
    } catch (err: any) {
      console.error("Scan failed:", err);
      setOutput(err?.message || "❌ Unknown error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white p-6 rounded-lg shadow-md w-full">
      <div className="flex items-center mb-4">
        <img src="/emblem.png" alt="TPN Logo" className="w-6 h-6 mr-2" />
        <h2 className="text-xl font-bold">Token Trust Score Scanner</h2>
      </div>

      <input
        className="w-full bg-gray-900 text-white p-2 rounded mb-2 focus:outline-none"
        placeholder="Token Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full bg-gray-900 text-white p-2 rounded mb-2 focus:outline-none"
        placeholder="Token Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />

      <button
        onClick={handleScan}
        disabled={loading}
        className={`w-full py-2 px-4 rounded bg-purple-600 hover:bg-purple-700 font-semibold ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Scanning..." : "Scan Token"}
      </button>

      {output && (
        <pre className="bg-gray-900 text-green-400 p-4 mt-4 rounded shadow-inner border border-gray-700 whitespace-pre-wrap text-sm overflow-x-auto">
          {output}
        </pre>
      )}
    </div>
  );
}













