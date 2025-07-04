"use client";
import React, { useState } from "react";
import Image from "next/image";
import emblem from "@/public/emblem.png";

export default function CreatorTrustScore() {
  const [creator, setCreator] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!creator) {
      alert("Please enter creator address.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/scanCreatorTrustScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator }),
      });

      const data = await res.json();
      if (data && data.output) {
        setOutput(data.output);
      } else {
        setOutput("⚠️ Unexpected response format.");
      }
    } catch (err) {
      setOutput("❌ Failed to fetch creator trust score.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Image src={emblem} alt="TPN" width={32} height={32} />
        <h1 className="text-2xl font-semibold">Creator Trust Score</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Creator Address"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          className="flex-1 bg-zinc-900 text-white p-2 rounded border border-zinc-700"
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto whitespace-pre-wrap min-h-[240px]">
        {output || "📥 Enter creator address to fetch their trust score..."}
      </pre>
    </div>
  );
}
