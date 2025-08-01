"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import TokenRegistry from "@/abi/TokenRegistry.json";

const TokenRegistryAbi = TokenRegistry.abi;

export default function StatusDot() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
        const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistry.abi, provider);
        const result = await registry.isPaused();
        setPaused(result);
      } catch {
        setPaused(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-6 flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${paused ? "bg-yellow-400" : "bg-green-400"}`}
        title={paused ? "Registry Paused" : "Registry Active"}
      />
      <span className="text-xs text-gray-400">{paused ? "Registry Paused" : "Registry Active"}</span>
    </div>
  );
}
