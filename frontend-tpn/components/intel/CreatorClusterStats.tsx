"use client";
import { useState } from "react";

export default function CreatorClusterStats() {
  const [creator, setCreator] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/scanCreatorClusterStatistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator }), // ✅ REQUIRED
      });

      const data = await res.json();
      setOutput(data.output || data.error || "⚠️ No output returned."); // ✅ fallback for both
    } catch (err) {
      console.error("❌ Scan failed:", err);
      setOutput("❌ Scan failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto">
      <div className="flex items-center mb-4">
        <img src="/emblem.png" alt="TPN Logo" className="w-6 h-6 mr-2" />
        <h2 className="text-xl font-bold">Creator Cluster Statistics</h2>
      </div>

      <input
        className="w-full bg-gray-900 text-white p-2 rounded mb-4 focus:outline-none"
        placeholder="0x..."
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
      />

      <button
        onClick={handleScan}
        disabled={loading}
        className={`w-full py-2 px-4 rounded bg-green-600 hover:bg-green-700 font-semibold ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Scanning..." : "Check Cluster"}
      </button>

      {output && (
        <pre className="bg-gray-900 text-green-400 p-4 mt-4 rounded shadow-inner border border-gray-700 whitespace-pre-wrap text-sm overflow-x-auto">
          {output}
        </pre>
      )}
    </div>
  );
}















