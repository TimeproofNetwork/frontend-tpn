"use client";

import { useState } from "react";
import { ethers } from "ethers";
import TokenRegistry from "@/abi/TokenRegistry.json";

const TokenRegistryAbi = TokenRegistry.abi;

export default function DAOStatusViewer() {
  const [address, setAddress] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!address) return;
    setLoading(true);
    setOutput("");

    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
      const registry = new ethers.Contract(process.env.NEXT_PUBLIC_TOKEN_REGISTRY!, TokenRegistryAbi, provider);

      const trustLevel: number = await registry.getTrustDetails(address);
      const isBanned: boolean = await registry.isDAOBanned(address);
      const isQuarantined: boolean = await registry.isQuarantined(address);

      const trustEmoji = trustLevel === 3 ? "🔵" : trustLevel === 2 ? "🟢" : trustLevel === 1 ? "🟡" : "⚪";

      setOutput(
        `📦 Token: ${address}\n🔒 Trust Level: ${trustEmoji} Level ${trustLevel}\n🛑 DAO Banned: ${isBanned ? "Yes" : "No"}\n⚠️ Quarantined: ${isQuarantined ? "Yes" : "No"}`
      );
    } catch (err: any) {
      setOutput("❌ Failed to fetch status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-md">
      <h3 className="text-lg font-semibold mb-4">🔎 Check Token Trust Status</h3>

      <input
        type="text"
        placeholder="Enter token address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full bg-black text-white border border-gray-700 px-4 py-2 rounded focus:outline-none"
      />

      <button
        onClick={handleCheck}
        disabled={loading}
        className="mt-4 w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check Status"}
      </button>

      {output && (
        <div className="mt-4 p-3 bg-black border border-gray-700 rounded text-sm whitespace-pre-wrap">
          {output}
        </div>
      )}
    </div>
  );
}

