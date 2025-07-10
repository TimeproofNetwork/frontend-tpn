"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function CreatorClusterStats() {
  const [creator, setCreator] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const scanCluster = async () => {
    setLoading(true);
    setResult("Scanning...");

    try {
      const res = await fetch("/api/scanCreatorClusterStatistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator }),
      });

      const data = await res.json();
      if (data?.output && typeof data.output === "string" && data.output.trim().length > 0) {
        setResult(data.output);
      } else {
        setResult("⚠️ No output returned.");
      }
    } catch (err) {
      setResult("❌ Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Image
          src="/emblem.png"
          alt="Timeproof Network Red Blue Shield Emblem"
          width={32}
          height={32}
          className="mr-3"
        />

          <h1 className="text-2xl font-bold">Creator Cluster Statistics</h1>
        </div>

        <input
          type="text"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          placeholder="Enter Creator Address"
          className="w-full bg-[#0f1624] text-white p-3 rounded mb-4"
        />

        <button
          onClick={scanCluster}
          disabled={loading || !creator}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
        >
          {loading ? "Scanning..." : "Check Cluster"}
        </button>

        {result && (
          <pre className="mt-6 bg-[#0f1624] text-green-400 p-4 rounded whitespace-pre-wrap">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}














