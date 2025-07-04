// /pages/api/scanSuspicionListDEX.ts

import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import levenshtein from "fast-levenshtein";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const TPN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

// ✅ Define Token Type for safety
interface TokenInfo {
  name: string;
  symbol: string;
  tokenAddress: string;
  registeredBy: string;
  timestamp?: number;
  index: number;
}

function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function unified(name: string, symbol: string): string {
  return sanitize(name + symbol);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST allowed." });
  }

  const { name: rawName, symbol: rawSymbol } = req.body;

  if (!rawName || !rawSymbol) {
    return res.status(400).json({ output: "❌ Token name and symbol are required!" });
  }

  const rpc = process.env.SEPOLIA_RPC_URL;
  if (!rpc) {
    return res.status(500).json({ output: "❌ RPC URL missing from environment!" });
  }

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const registry = new ethers.Contract(TPN_REGISTRY, TokenRegistryAbi.abi, provider);

  const name = sanitize(rawName);
  const symbol = sanitize(rawSymbol);
  const unifiedInput = unified(name, symbol);
  const isSC = symbol.length <= 3;

  let tokens: TokenInfo[] = [];
  try {
    const rawTokens = await registry.getTokenLogbook();
    tokens = rawTokens.map((token: any, index: number): TokenInfo => ({
      name: sanitize(token.name),
      symbol: sanitize(token.symbol),
      tokenAddress: token.tokenAddress,
      registeredBy: token.registeredBy,
      timestamp: token.timestamp ? Number(token.timestamp.toString()) : undefined,
      index,
    }));
  } catch (err: any) {
    return res.status(500).json({
      output: `❌ Failed to fetch tokens from registry.\n${err.message || String(err)}`,
    });
  }

  const inputIndex = tokens.findIndex((token: TokenInfo) => unified(token.name, token.symbol) === unifiedInput);
  const inputToken: TokenInfo = inputIndex !== -1 ? tokens[inputIndex] : {
    name,
    symbol,
    tokenAddress: "❓ (Unregistered)",
    registeredBy: "undefined",
    timestamp: undefined,
    index: -1,
  };

  const candidates = tokens.filter((token: TokenInfo) => {
    if (token.index === inputToken.index) return false;
    if (!token.timestamp || (inputToken.timestamp && token.timestamp >= inputToken.timestamp)) return false;

    const nameDist = levenshtein.get(name, token.name);
    const symDist = levenshtein.get(symbol, token.symbol);
    const uniDist = levenshtein.get(unifiedInput, unified(token.name, token.symbol));

    return isSC ? (nameDist <= 3 && symDist <= 2) : uniDist <= 2;
  });

  const clusterTokens = [...new Set(candidates.map((token: TokenInfo) => token.index))];
  const baseToken = candidates[0];
  const baseIndex = baseToken ? baseToken.index : -1;

  const outputLines: string[] = [];
  outputLines.push(`🔎 Scanning Token: ${rawName} (${rawSymbol})`);
  outputLines.push(`📦 Address: ${inputToken.tokenAddress}`);
  outputLines.push(`🧑 Creator: ${inputToken.registeredBy}`);
  if (inputToken.timestamp) {
    outputLines.push(`📅 Registered: ${new Date(inputToken.timestamp * 1000).toLocaleString("en-US")}`);
  }

  if (clusterTokens.length > 0 && baseToken) {
    outputLines.push(`\n🧠 Suspicion Cluster Detected (${clusterTokens.length + 1} tokens)`);
    outputLines.push(`✅ Base Token: ${baseToken.name} (${baseToken.symbol}) | Registered at #${baseIndex}`);
    outputLines.push(`📍 Closest Token: ${baseToken.name} (${baseToken.symbol}) | Registered at #${baseIndex}`);
  } else {
    outputLines.push(`\n✅ No Suspicion Cluster Detected.`);
  }

  return res.status(200).json({ output: outputLines.join("\n") });
}




































