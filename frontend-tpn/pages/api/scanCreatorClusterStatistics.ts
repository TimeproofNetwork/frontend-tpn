// /pages/api/scanCreatorClusterStatistics.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

type Data = {
  output?: string;
  error?: string;
};

const TPN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

interface TokenInfo {
  name: string;
  symbol: string;
  tokenAddress: string;
  registeredBy: string;
  timestamp?: number;
  index: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Only POST method is allowed." });
  }

  const creator = req.body.creator?.trim();
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!creator || !rpcUrl) {
    return res.status(400).json({
      error: "❌ Creator address or RPC URL missing from request or environment!",
    });
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const registry = new ethers.Contract(TPN_REGISTRY, TokenRegistryAbi.abi, provider);

  let tokens: TokenInfo[] = [];

  try {
    const rawTokens = await registry.getTokenLogbook();
    tokens = rawTokens.map((token: any, index: number): TokenInfo => ({
      name: token.name,
      symbol: token.symbol,
      tokenAddress: token.tokenAddress,
      registeredBy: token.registeredBy,
      timestamp: token.timestamp ? Number(token.timestamp.toString()) : undefined,
      index,
    }));
  } catch (err: any) {
    return res.status(500).json({
      error: `❌ Failed to fetch token logbook.\n\n${err.message || String(err)}`,
    });
  }

  const creatorTokens = tokens.filter((token) => token.registeredBy.toLowerCase() === creator.toLowerCase());
  const clusterSize = creatorTokens.length;

  const outputLines: string[] = [];
  outputLines.push(`🔍 Creator Cluster Statistics`);
  outputLines.push(`🧑 Creator Address: ${creator}`);
  outputLines.push(`\n📊 Total Tokens Created: ${clusterSize}`);

  if (clusterSize > 0) {
    creatorTokens.forEach((token) => {
      const dateStr = token.timestamp
        ? new Date(token.timestamp * 1000).toLocaleString("en-US")
        : "Unknown Date";
      outputLines.push(
        `\n• ${token.name} (${token.symbol}) | Address: ${token.tokenAddress} | Registered: ${dateStr} | Index #${token.index}`
      );
    });
  } else {
    outputLines.push(`\n✅ No tokens found for this creator in registry.`);
  }

  return res.status(200).json({
    output: outputLines.join("\n"),
  });
}




























