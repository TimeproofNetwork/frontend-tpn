// /pages/api/scanCreatorTrustScore.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const TPN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function unified(name: string, symbol: string): string {
  return sanitize(name + symbol);
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function isSC(a: any, b: any): boolean {
  const n1 = sanitize(a.name);
  const n2 = sanitize(b.name);
  const s1 = sanitize(a.symbol);
  const s2 = sanitize(b.symbol);
  return s1.length <= 3 && s2.length <= 3 && editDistance(n1, n2) <= 3 && editDistance(s1, s2) <= 2;
}

function isLSIC(a: any, b: any): boolean {
  const s1 = sanitize(a.symbol);
  const s2 = sanitize(b.symbol);
  if (s1.length <= 3 || s2.length <= 3) return false;
  const id1 = unified(a.name, a.symbol);
  const id2 = unified(b.name, b.symbol);
  return editDistance(id1, id2) <= 2;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST method is allowed." });
  }

  const creator = req.body.creator?.trim();
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!creator || !rpcUrl) {
    return res.status(400).json({ output: `❌ Creator address or RPC URL missing from request or environment!` });
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const registry = new ethers.Contract(TPN_REGISTRY, TokenRegistryAbi.abi, provider);

  const tokens: any[] = [];
  try {
    const rawTokens = await registry.getTokenLogbook();
    rawTokens.forEach((token: any, index: number) => {
      tokens.push({
        name: token.name,
        symbol: token.symbol,
        address: token.tokenAddress,
        creator: token.registeredBy,
        timestamp: token.timestamp ? Number(token.timestamp.toString()) : 0,
        index,
      });
    });
  } catch (err: any) {
    return res.status(500).json({ output: `❌ Failed to fetch token logbook.\n\n${err.message || String(err)}` });
  }

  const creatorTokens = tokens.filter(t => t.creator.toLowerCase() === creator.toLowerCase());

  if (creatorTokens.length === 0) {
    return res.status(200).json({ output: `❌ No tokens found for creator: ${creator}` });
  }

  const lines: string[] = [];
  lines.push(`\n🔍 Suspicion Scan started by: ${creator}`);
  lines.push(`📚 Fetching registered tokens from logbook...`);
  lines.push(`✅ Fetched ${tokens.length} tokens from registry.`);

  let suspicious = 0;
  for (const token of creatorTokens) {
    const isClone = tokens.some(other => other.index !== token.index && (isSC(token, other) || isLSIC(token, other)));
    if (isClone) suspicious++;
  }

  lines.push(`\n📦 Total tokens created: ${creatorTokens.length}`);
  lines.push(`🧪 Suspicious tokens found: ${suspicious}`);

  const trustScore = Math.max(0, 100 - suspicious * 10);
  lines.push(`\n📊 Estimated Trust Score: ${trustScore}/100`);

  if (trustScore >= 90) {
    lines.push(`✅ Creator is highly trustworthy.`);
  } else if (trustScore >= 60) {
    lines.push(`⚠️ Moderate risk. Review token lineage.`);
  } else {
    lines.push(`🚨 High risk. Creator may be deploying clones.`);
  }

  return res.status(200).json({ output: lines.join("\n") });
}

















