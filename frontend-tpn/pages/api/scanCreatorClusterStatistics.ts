// /pages/api/scanCreatorClusterStatistics.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";
import levenshtein from "fast-levenshtein"; // ✅ Fast Levenshtein Import

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

function sanitizeInput(str: string): string {
  return str?.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

function normalizeAddress(str: string): string {
  return str?.trim().toLowerCase();
}

function editDistance(a: string, b: string): number {
  return levenshtein.get(a, b);
}

function isSuspicious(input: Token, prior: Token): boolean {
  const s1 = sanitizeInput(input.symbol);
  const s2 = sanitizeInput(prior.symbol);
  const n1 = sanitizeInput(input.name);
  const n2 = sanitizeInput(prior.name);

  // SC Rule: short symbol ≤ 3
  if (s1.length <= 3) {
    return editDistance(n1, n2) <= 3 && editDistance(s1, s2) <= 3;
  }

  // LSIC Rule: long symbol > 3
  const id1 = sanitizeInput(input.name + input.symbol);
  const id2 = sanitizeInput(prior.name + prior.symbol);
  return editDistance(id1, id2) <= 3;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ output: "❌ Only POST method is allowed." });

  const creatorInput = normalizeAddress(req.body.creator || "");
  if (!RPC_URL) return res.status(400).json({ output: `❌ RPC URL missing from environment!` });

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
        creator: normalizeAddress(token.registeredBy),
        timestamp: token.timestamp ? Number(token.timestamp.toString()) : 0,
        index,
      });
    });
    tokens.sort((a, b) => a.timestamp - b.timestamp);
  } catch (err: any) {
    return res.status(500).json({ output: `❌ Failed to fetch token logbook.\n\n${err.message || String(err)}` });
  }

  const lines: string[] = [];
  lines.push(`\n🔍 Scanning registered tokens using: ${creatorInput}`);
  lines.push("📚 Fetching registered tokens from logbook...");
  lines.push(`✅ Fetched ${tokens.length} tokens from registry.`);

  const clusters: Token[][] = [];
  const assigned = new Set<number>();
  const globalRoots: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prior = tokens.slice(0, i);
    const isRoot = !prior.some(p => isSuspicious(token, p));
    if (isRoot) globalRoots.push(token);
  }

  for (const root of globalRoots) {
    if (assigned.has(root.index)) continue;
    const cluster: Token[] = [root];

    for (let j = root.index + 1; j < tokens.length; j++) {
      const t = tokens[j];
      if (assigned.has(t.index)) continue;
      if (isSuspicious(t, root)) cluster.push(t);
    }

    if (cluster.length >= 2) {
      cluster.forEach(t => assigned.add(t.index));
      clusters.push(cluster);
    }
  }

  const stats: Record<string, { total: number; clusters: Set<number>; contribution: number }> = {};
  tokens.forEach(t => {
    const addr = normalizeAddress(t.creator);
    if (!stats[addr]) stats[addr] = { total: 0, clusters: new Set(), contribution: 0 };
    stats[addr].total++;
  });

  clusters.forEach((cluster, idx) => {
    const root = cluster[0];
    const contributors = new Set<string>();

    for (const token of cluster) {
      if (isSuspicious(token, root)) contributors.add(normalizeAddress(token.creator));
    }

    for (const creator of contributors) {
      const norm = normalizeAddress(creator);
      if (!stats[norm]) continue;
      const tokensByCreator = cluster.filter(t => normalizeAddress(t.creator) === norm);
      if (tokensByCreator.length > 0) {
        stats[norm].clusters.add(idx);
        stats[norm].contribution += tokensByCreator.length;
      }
    }
  });

  for (const creator in stats) {
    const suspicious = tokens.filter(t => normalizeAddress(t.creator) === normalizeAddress(creator) && assigned.has(t.index));
    if (suspicious.length === 0) {
      stats[creator].clusters.clear();
      stats[creator].contribution = 0;
    }
  }

  const scores = Object.entries(stats)
    .map(([creator, data]) => {
      const clusterCount = data.clusters.size;
      const clusterContribution = data.contribution;
      const crs = clusterCount * clusterContribution + clusterCount / data.total;
      return { creator, clusterCount, clusterContribution, crs: crs.toFixed(2) };
    })
    .filter(e => e.clusterCount > 0)
    .sort((a, b) => Number(b.crs) - Number(a.crs));

  lines.push(`\n🔎 Identified ${clusters.length} suspicion clusters.`);
  lines.push("\n📊 Ranked Creator Cluster Scores:\n");

  scores.forEach((e, i) => {
    if (i === 0 || normalizeAddress(e.creator) === creatorInput) {
      lines.push(`#${i + 1}  🧑‍💻 ${e.creator} → Clusters: ${e.clusterCount} | Cluster Contribution: ${e.clusterContribution}`);
    }
  });

  if (!scores.find(e => normalizeAddress(e.creator) === creatorInput)) {
    lines.push(`❌ No clusters found for ${creatorInput}`);
  }

  return res.status(200).json({ output: lines.join("\n") });
}






























































