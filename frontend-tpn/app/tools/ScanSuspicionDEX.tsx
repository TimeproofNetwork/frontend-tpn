"use client";
import React, { useState } from "react";
import Image from "next/image";
import emblem from "@/public/emblem.png";

export default function ScanSuspicionDEX() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!name || !symbol) {
      alert("Please enter both name and symbol.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/scanSuspicionListDEX", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, symbol }),
      });

      const data = await res.json();
      setOutput(data?.output || "⚠️ Unexpected response format.");
    } catch (err) {
      setOutput("❌ Failed to fetch suspicion cluster.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Image src={emblem} alt="Timeproof Network Red Blue Shield Emblem" width={32} height={32} />

        <h1 className="text-2xl font-semibold">Suspicion Check for DEX Listing</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Token Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-zinc-900 text-white p-2 rounded border border-zinc-700"
        />
        <input
          type="text"
          placeholder="Token Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="flex-1 bg-zinc-900 text-white p-2 rounded border border-zinc-700"
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Scanning..." : "Check Risk"}
        </button>
      </div>

      <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto whitespace-pre-wrap min-h-[240px]">
        {output || "📥 Enter token name & symbol to check for suspicious clones..."}
      </pre>
    </div>
  );
}

