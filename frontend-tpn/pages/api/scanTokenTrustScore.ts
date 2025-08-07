// /pages/api/scanTokenTrustScore.ts

import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import levenshtein from "fast-levenshtein";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;

function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function unified(name: string, symbol: string): string {
  return sanitize(name + symbol);
}

function isSuspicious(candidate: any, root: any): boolean {
  const u1 = unified(candidate.name, candidate.symbol);
  const u2 = unified(root.name, root.symbol);
  return levenshtein.get(u1, u2) <= 3;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name: rawName, symbol: rawSymbol } = req.body;

  if (typeof rawName !== "string" || typeof rawSymbol !== "string") {
    return res.status(400).json({ output: "❌ Invalid or missing token name/symbol." });
  }

  const name = sanitize(rawName);
  const symbol = sanitize(rawSymbol);
  const unifiedInput = unified(name, symbol);
  const isSC = symbol.length <= 3;

  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);

  const rawTokens = await registry.getTokenLogbook();
  const tokens = rawTokens.map((token: any, index: number) => ({ ...token, index }));
  tokens.sort((a: any, b: any) => a.timestamp - b.timestamp);

  const inputIndex = tokens.findIndex((t: any) => unified(t.name, t.symbol) === unifiedInput);
  const isRegistered = inputIndex !== -1;

  const input = isRegistered
  ? {
      ...tokens[inputIndex],
      tokenAddress: tokens[inputIndex].tokenAddress?.toLowerCase?.() || "",
      registeredBy: tokens[inputIndex].registeredBy?.toLowerCase?.() || "",
      name: tokens[inputIndex].name,
      symbol: tokens[inputIndex].symbol,
      timestamp: tokens[inputIndex].timestamp,
      index: tokens[inputIndex].index,
    }
  : {
      name,
      symbol,
      tokenAddress: "unregistered",
      registeredBy: "unregistered",
      timestamp: undefined,
      index: -1
    };

  let trustLevel = -1;
  try {
    if (isRegistered && input.tokenAddress) {
      const trustRaw = await registry.getTrustDetails(input.tokenAddress);
      const levelCandidate = Array.isArray(trustRaw) ? trustRaw[2] : trustRaw.trustLevel;
      trustLevel = ethers.BigNumber.isBigNumber(levelCandidate) ? levelCandidate.toNumber() : levelCandidate;
    }
  } catch (_) {}

  // 🛡️ DAO Ban Check — top priority, no fallback
try {
  if (isRegistered) {
    const isDaoBanned = await registry.isDAOPunished(rawName, rawSymbol);
    if (isDaoBanned) {
      const lines: string[] = [];
      lines.push(`🔎 Scanning Token: ${rawName} (${rawSymbol})`);
      lines.push(`📦 Address: ${input.tokenAddress}`);
      lines.push(`🧑 Creator: ${input.registeredBy}`);
      if (input.timestamp) {
        lines.push(`📅 Registered: ${new Date(Number(input.timestamp) * 1000).toLocaleString("en-US")}`);
      }
      lines.push(`🔒 Trust Level: ⚫ Level 0`);
      lines.push(`📊 Estimated Trust Score: 0/100`);
      lines.push(`⚫ Caution — Token is DAO Banned.`);
      return res.status(200).json({ output: lines.join("\n") });
    }
  }
} catch (error) {
  console.error("❌ DAO Ban check failed:", error);
}

  const trustEmoji =
    trustLevel === 3 ? "🟣" :
    trustLevel === 2 ? "🟢" :
    trustLevel === 1 ? "🟡" :
    trustLevel === 0 ? "⚫" : "⚪";

  const lines: string[] = [];
  lines.push(`🔎 Scanning Token: ${rawName} (${rawSymbol})`);
  lines.push(`📦 Address: ${input.tokenAddress}`);
  lines.push(`🧑 Creator: ${input.registeredBy}`);
  if (input.timestamp) lines.push(`📅 Registered: ${new Date(Number(input.timestamp) * 1000).toLocaleString("en-US")}`);
  lines.push(`🔒 Trust Level: ${trustEmoji} Level ${trustLevel === -1 ? "— Undefined" : trustLevel}`);

  const trustBonus = trustLevel === 3 ? 50 : trustLevel === 2 ? 40 : trustLevel === 1 ? 10 : 0;
  let score = 50;
  let clusterOutput = "";
  let clusterFound = false;

  const candidates = tokens.filter((t: any) => {
    if (input.timestamp && t.timestamp >= input.timestamp) return false;
    return levenshtein.get(unifiedInput, unified(t.name, t.symbol)) <= 3;
  }).map((t: any) => {
    const totalEdit = levenshtein.get(unifiedInput, unified(t.name, t.symbol));
    return { ...t, totalEdit };
  });

  candidates.sort((a: any, b: any) => a.totalEdit !== b.totalEdit ? a.totalEdit - b.totalEdit : a.timestamp - b.timestamp);

  if (candidates.length > 0) {
    const root = candidates[0];
    const rootIndex = root.index === -1 || root.index === undefined ? "Unregistered" : root.index;

    const rawCluster = tokens.filter((token: any) => isSuspicious(token, root));
    const unique = new Map(rawCluster.map((token: any) => [unified(token.name, token.symbol), token]));
    const deduped = Array.from(unique.values());

    if (!deduped.find((t: any) => t.name === input.name && t.symbol === input.symbol)) {
      deduped.push(input);
    }

    clusterFound = true;

    const inputDist = (token: any) => levenshtein.get(unifiedInput, unified(token.name, token.symbol));

    const closest = deduped.reduce((a: any, b: any) => {
      const distA = inputDist(a);
      const distB = inputDist(b);
      if (distA < distB) return a;
      if (distA === distB) return a.timestamp < b.timestamp ? a : b;
      return b;
    }) as { name: string; symbol: string; index?: number };

    const closestIndex = closest.index === -1 || closest.index === undefined ? "Unregistered" : closest.index;
    const closestRegisteredAt = closestIndex === "Unregistered" ? "Unregistered" : `#${closestIndex}`;

    clusterOutput += `\n🧠 Suspicion Cluster Detected (${deduped.length} tokens)`;
    clusterOutput += `\n✅ Base Token: ${root.name} (${root.symbol}) | Registered at #${rootIndex}`;
    clusterOutput += `\n📍 Closest Token: ${closest.name} (${closest.symbol}) | Registered at ${closestRegisteredAt}`;
  }

  if (isRegistered) {
    if (!clusterFound || unified(input.name, input.symbol) === unified(candidates[0].name, candidates[0].symbol)) {
      score += trustBonus;
    } else {
      const penalty = isSC ? 10 : 25;
      score += trustBonus - penalty;
    }
  } else {
    if (clusterFound) {
      const penalty = isSC ? 10 : 25;
      score -= penalty;
    }
  }

  score = Math.max(0, score);

  if (clusterOutput) lines.push(clusterOutput.trim());
  lines.push(`📊 Estimated Trust Score: ${score}/100`);

  if (!isRegistered && !clusterFound) {
    lines.push(`✅ Recommendation: Can proceed to register safely as Root Token.`);
  } else if (!isRegistered && clusterFound) {
    lines.push(`❗ Recommendation: Token will be marked suspicious.`);
  } else if (score === 100) {
    lines.push(`✅ Excellent — Audit and Exchange Verified — Maximum Trust Achieved.`);
  } else if (score === 90) {
    lines.push(`🟢 Exchange Verified — High Trust.`);
  } else if (score === 60 && !clusterFound) {
    lines.push(`🟢 Root Token — No Suspicion Clusters Found.`);
  } else if (score === 50) {
    lines.push(`🟡 Caution — Investigate history before trusting.`);
  } else {
    lines.push(`❗ Recommendation: Investigate token lineage before trusting.`);
  }

  return res.status(200).json({ output: lines.join("\n") });
}

































































