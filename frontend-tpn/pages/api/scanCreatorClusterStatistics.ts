// /pages/api/scanCreatorClusterStatistics.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const RPC_URL = process.env.SEPOLIA_RPC_URL;

interface Token {
  name: string;
  symbol: string;
  address: string;
  creator: string;
  timestamp: number;
  index: number;
}

function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = (a[i - 1] === b[j - 1]) ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function isSC(input: Token, prior: Token): boolean {
  const n1 = sanitize(input.name);
  const n2 = sanitize(prior.name);
  const s1 = sanitize(input.symbol);
  const s2 = sanitize(prior.symbol);
  return s1.length <= 3 && editDistance(n1, n2) <= 3 && editDistance(s1, s2) <= 2;
}

function isLSIC(input: Token, prior: Token): boolean {
  const s1 = sanitize(input.symbol);
  if (s1.length <= 3) return false;
  const id1 = sanitize(input.name + input.symbol);
  const id2 = sanitize(prior.name + prior.symbol);
  return editDistance(id1, id2) <= 2;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST method is allowed." });
  }

  const creatorInput = req.body.creator?.trim().toLowerCase() || "";

  if (!RPC_URL) {
    return res.status(400).json({ output: `❌ RPC URL missing from environment!` });
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);

  const tokens: Token[] = [];
  try {
    const rawTokens = await registry.getTokenLogbook();
    rawTokens.forEach((token: any, index: number) => {
      tokens.push({
        name: token.name,
        symbol: token.symbol,
        address: token.tokenAddress,
        creator: token.registeredBy.toLowerCase(),
        timestamp: token.timestamp ? Number(token.timestamp.toString()) : 0,
        index,
      });
    });

    tokens.sort((a, b) => a.timestamp - b.timestamp); // ✅ Canonical sort by timestamp

  } catch (err: any) {
    return res.status(500).json({ output: `❌ Failed to fetch token logbook.\n\n${err.message || String(err)}` });
  }

  const lines: string[] = [];
  lines.push(`\n🔍 Scanning registered tokens using: ${creatorInput}`);
  lines.push("📚 Fetching registered tokens from logbook...");
  lines.push(`✅ Fetched ${tokens.length} tokens from registry.`);

  const clusters: Token[][] = [];
  const assignedTokens = new Set<number>();
  const rootTokens = new Set<number>();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const priorTokens = tokens.filter(t => t.timestamp < token.timestamp);

    let isRoot = true;
    for (const prior of priorTokens) {
      const isSCInput = token.symbol.length <= 3;
      if (isSCInput && isSC(token, prior)) {
        isRoot = false;
        break;
      }
      if (!isSCInput && isLSIC(token, prior)) {
        isRoot = false;
        break;
      }
    }

    if (isRoot) rootTokens.add(token.index);
  }

  for (let i = 0; i < tokens.length; i++) {
    const base = tokens[i];

    if (!rootTokens.has(base.index)) continue;
    if (assignedTokens.has(base.index)) continue;

    const cluster: Token[] = [base];

    for (let j = i + 1; j < tokens.length; j++) {
      const candidate = tokens[j];
      if (candidate.timestamp <= base.timestamp) continue;
      if (assignedTokens.has(candidate.index)) continue;

      const isSCCandidate = candidate.symbol.length <= 3;

      if (isSCCandidate) {
        if (isSC(candidate, base)) cluster.push(candidate);
      } else {
        if (isLSIC(candidate, base)) cluster.push(candidate);
      }
    }

    if (cluster.length < 2) continue;

    const alreadyAssigned = cluster.some(t => assignedTokens.has(t.index));
    if (alreadyAssigned) continue;

    clusters.push(cluster);
    cluster.forEach(t => assignedTokens.add(t.index));
  }

  const creatorStats: Record<string, { total: number, clusters: Set<number>, contribution: number }> = {};

  tokens.forEach((token: Token) => {
    const addr = token.creator;
    if (!creatorStats[addr]) {
      creatorStats[addr] = { total: 0, clusters: new Set(), contribution: 0 };
    }
    creatorStats[addr].total++;
  });

  clusters.forEach((cluster: Token[], idx: number) => {
    cluster.forEach((token: Token) => {
      const addr = token.creator;
      if (!creatorStats[addr]) return;
      creatorStats[addr].clusters.add(idx);
      creatorStats[addr].contribution++;
    });
  });

  const scores = Object.entries(creatorStats)
    .filter(([_, data]) => data.clusters.size > 0 && data.contribution >= 1)
    .map(([creator, data]) => {
      const clusterCount = data.clusters.size;
      const clusterContribution = data.contribution;
      const crs = (clusterCount * clusterContribution) + (clusterCount / data.total);
      return {
        creator,
        clusterCount,
        clusterContribution,
        crs: crs.toFixed(2),
      };
    })
    .sort((a, b) => Number(b.crs) - Number(a.crs));

  lines.push(`\n🔎 Identified ${clusters.length} suspicion clusters.`);
  lines.push("\n📊 Ranked Creator Cluster Scores:\n");

  const top = scores[0];
  const targetIndex = scores.findIndex(s => s.creator === creatorInput);
  const target = targetIndex !== -1 ? scores[targetIndex] : null;

  if (top && (!target || top.creator !== creatorInput)) {
    lines.push(`#1  🧑‍💻 ${top.creator} → Clusters: ${top.clusterCount} | Cluster Contribution: ${top.clusterContribution}`);
  }

  if (target) {
    const rank = targetIndex + 1;
    lines.push(`#${rank}  🧑‍💻 ${target.creator} → Clusters: ${target.clusterCount} | Cluster Contribution: ${target.clusterContribution}`);
  } else {
    lines.push(`❌ No clusters found for ${creatorInput}`);
  }

  return res.status(200).json({ output: lines.join("\n") });
}

















































