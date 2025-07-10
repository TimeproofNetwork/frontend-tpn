// /pages/api/scanTokenTrustScore.ts

import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import levenshtein from "fast-levenshtein";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const TPN_TOKEN = process.env.NEXT_PUBLIC_TPN_TOKEN as `0x${string}`;
const BADGE_NFT = process.env.NEXT_PUBLIC_BADGE_NFT as `0x${string}`;
const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;


function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function unified(name: string, symbol: string): string {
  return sanitize(name + symbol);
}

function isSuspicious(candidate: any, root: any): boolean {
  const n1 = sanitize(candidate.name);
  const n2 = sanitize(root.name);
  const s1 = sanitize(candidate.symbol);
  const s2 = sanitize(root.symbol);

  if (s1.length <= 3 && s2.length <= 3) {
    return levenshtein.get(n1, n2) <= 3 && levenshtein.get(s1, s2) <= 2;
  }

  if (s1.length > 3 && s2.length > 3) {
    const id1 = unified(candidate.name, candidate.symbol);
    const id2 = unified(root.name, root.symbol);
    return levenshtein.get(id1, id2) <= 2;
  }

  return false;
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

  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);  // ✅ Fixed: Correct backend RPC key
  const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);

  const rawTokens = await registry.getTokenLogbook();
  const tokens = rawTokens.map((token: any, index: number) => ({ ...token, index }));

  const inputIndex = tokens.findIndex((t: any) => unified(t.name, t.symbol) === unifiedInput);
  const isRegistered = inputIndex !== -1;

  const input = isRegistered ? tokens[inputIndex] : {
    name,
    symbol,
    tokenAddress: "❓ (Unregistered)",
    registeredBy: "undefined",
    timestamp: undefined,
    index: -1
  };

  let trustLevel = 0;
  try {
    if (isRegistered && input.tokenAddress) {
      const trustRaw = await registry.getTrustDetails(input.tokenAddress);
      const levelCandidate = Array.isArray(trustRaw) ? trustRaw[2] : trustRaw.trustLevel;
      trustLevel = ethers.BigNumber.isBigNumber(levelCandidate) ? levelCandidate.toNumber() : levelCandidate;
    }
  } catch (_) {}

  const trustEmoji = trustLevel === 3 ? "🟣" : trustLevel === 2 ? "🟢" : trustLevel === 1 ? "🟡" : "⚫";

  const candidates = tokens.filter((t: any) => {
    if (t.index === input.index) return false;
    if (!t.timestamp || (input.timestamp && t.timestamp >= input.timestamp)) return false;
    const nameEdit = levenshtein.get(sanitize(name), sanitize(t.name));
    const symEdit = levenshtein.get(sanitize(symbol), sanitize(t.symbol));
    const unifiedEdit = levenshtein.get(unifiedInput, unified(t.name, t.symbol));
    if (isSC) return nameEdit <= 3 && symEdit <= 2;
    return unifiedEdit <= 2;
  }).map((t: any) => {
    const totalEdit = isSC
      ? levenshtein.get(sanitize(name), sanitize(t.name)) + levenshtein.get(sanitize(symbol), sanitize(t.symbol))
      : levenshtein.get(unifiedInput, unified(t.name, t.symbol));
    return { ...t, totalEdit };
  });

  candidates.sort((a: any, b: any) => a.totalEdit !== b.totalEdit ? a.totalEdit - b.totalEdit : a.timestamp - b.timestamp);

  let clusterIndices: number[] = [];
  let clusterOutput = "";
  let baseIndex = -1;
  let closestIndex = -1;

  if (candidates.length > 0) {
    const root = candidates[0];
    baseIndex = root.index;

    const rawCluster = tokens.filter((token: any) => isSuspicious(token, root));
    const unique = new Map(rawCluster.map((token: any) => [unified(token.name, token.symbol), token]));
    const deduped = Array.from(unique.values());

    if (!deduped.find((t: any) => t.index === input.index) && input.index !== -1) {
      deduped.push(input);
    }

    clusterIndices = deduped.map((t: any) => t.index);

    const inputDist = (idx: number): number => isSC
      ? levenshtein.get(name, sanitize(tokens[idx].name)) + levenshtein.get(symbol, sanitize(tokens[idx].symbol))
      : levenshtein.get(unifiedInput, unified(tokens[idx].name, tokens[idx].symbol));

    closestIndex = clusterIndices.reduce((minIdx, idx) => {
      const dist = inputDist(idx);
      const minDist = inputDist(minIdx);
      if (dist < minDist) return idx;
      if (dist === minDist) return tokens[idx].timestamp < tokens[minIdx].timestamp ? idx : minIdx;
      return minIdx;
    }, clusterIndices[0]);

    const baseToken = tokens[baseIndex];
    const closestToken = tokens[closestIndex];

    clusterOutput += `\n🧠 Suspicion Cluster Detected (${clusterIndices.length} tokens)`;
    clusterOutput += `\n✅ Base Token: ${baseToken.name} (${baseToken.symbol}) | Registered at #${baseToken.index}`;
    clusterOutput += `\n📍 Closest Token: ${closestToken.name} (${closestToken.symbol}) | Registered at #${closestToken.index}`;
  }

  const trustBonus = trustLevel === 3 ? 50 : trustLevel === 2 ? 40 : trustLevel === 1 ? 10 : 0;
  let score = 50;
  const isBase =
  clusterIndices.length === 0 ||
  (baseIndex !== -1 && (
    unified(tokens[baseIndex].name, tokens[baseIndex].symbol) === unifiedInput ||
    (isRegistered && baseIndex === inputIndex)
  ));

  if (clusterIndices.length === 0 || isBase) {
    score += trustBonus;
  } else {
    const penalty = isSC ? 10 : 25;
    score += trustBonus - penalty;
  }

  score = Math.max(0, score);

  const lines: string[] = [];
  lines.push(`🔎 Scanning Token: ${rawName} (${rawSymbol})`);
  lines.push(`📦 Address: ${input.tokenAddress}`);
  lines.push(`🧑 Creator: ${input.registeredBy}`);
  if (input.timestamp) lines.push(`📅 Registered: ${new Date(Number(input.timestamp) * 1000).toLocaleString("en-US")}`);
  lines.push(`🔒 Trust Level: ${trustEmoji} Level ${trustLevel}`);
  if (clusterOutput) lines.push(clusterOutput.trim());
  lines.push(`📊 Estimated Trust Score: ${score}/100`);

  if (score === 100) {
    lines.push(`✅ Excellent — Audit and Exchange Verified — Maximum Trust Achieved.`);
  } else if (score === 90) {
    lines.push(`🟢 Exchange Verified — High Trust.`);
  } else if (score === 60 && isBase && clusterIndices.length === 0) {
    lines.push(`🟢 Root Token — No Suspicion Clusters Found.`);
  } else if (score === 50) {
    lines.push(`🟡 Caution — Investigate history before trusting.`);
  } else {
    lines.push(`❗ Recommendation: Investigate token lineage before trusting.`);
  }

  return res.status(200).json({ output: lines.join("\n") });
}


























































