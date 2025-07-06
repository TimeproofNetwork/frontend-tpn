import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const TPN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
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

function isSuspicious(candidate: { name: string; symbol: string }, root: { name: string; symbol: string }): boolean {
  const n1 = sanitize(candidate.name);
  const n2 = sanitize(root.name);
  const s1 = sanitize(candidate.symbol);
  const s2 = sanitize(root.symbol);

  const nameDist = editDistance(n1, n2);
  const symbolDist = editDistance(s1, s2);

  if (s1.length <= 3 && s2.length <= 3) {
    return nameDist <= 3 && symbolDist <= 2;
  }

  if (s1.length > 3 && s2.length > 3) {
    const id1 = sanitize(n1 + s1);
    const id2 = sanitize(n2 + s2);
    return editDistance(id1, id2) <= 2;
  }

  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST method is allowed." });
  }

  const creatorInput = req.body.creator?.trim().toLowerCase() || "";
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    return res.status(400).json({ output: `❌ RPC URL missing from environment!` });
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
        creator: token.registeredBy.toLowerCase(),
        timestamp: token.timestamp ? Number(token.timestamp.toString()) : 0,
        index,
      });
    });
  } catch (err: any) {
    return res.status(500).json({ output: `❌ Failed to fetch token logbook.\n\n${err.message || String(err)}` });
  }

  const lines: string[] = [];
  lines.push(`\n🔍 Scanning registered tokens using: ${creatorInput}`);
  lines.push("📚 Fetching registered tokens from logbook...");
  lines.push(`✅ Fetched ${tokens.length} tokens from registry.`);

  const clusters: any[] = [];
  const clustered = new Set<number>();

  for (let i = 0; i < tokens.length; i++) {
    if (clustered.has(i)) continue;

    const root = tokens[i];
    const cluster = [root];

    for (let j = 0; j < tokens.length; j++) {
      if (i === j) continue;
      if (isSuspicious(tokens[j], root)) {
        cluster.push(tokens[j]);
        clustered.add(j);
      }
    }

    if (cluster.length > 1) {
      cluster.forEach(t => clustered.add(t.index));
      clusters.push(cluster);
    }
  }

  const creatorMap: Record<string, { clusters: Set<number>, total: number, clusterSize: number }> = {};

  tokens.forEach(token => {
    const addr = token.creator;
    if (!creatorMap[addr]) {
      creatorMap[addr] = { clusters: new Set(), total: 0, clusterSize: 0 };
    }
    creatorMap[addr].total += 1;
  });

  clusters.forEach((cluster, idx) => {
    const counted = new Set<string>();
    cluster.forEach((token: any) => {
      const addr = token.creator;
      creatorMap[addr].clusterSize += 1;
      if (!counted.has(addr)) {
        creatorMap[addr].clusters.add(idx);
        counted.add(addr);
      }
    });
  });

  const scores = Object.entries(creatorMap)
    .map(([creator, data]) => {
      const totalClusters = data.clusters.size;
      const totalClusterSize = data.clusterSize;
      const crs = totalClusters > 0 ? (totalClusterSize * totalClusters) + (totalClusters / data.total) : 0;
      return {
        creator,
        clusterCount: totalClusters,
        clusterSize: totalClusterSize,
        crs: crs.toFixed(2),
      };
    })
    .sort((a, b) => Number(b.crs) - Number(a.crs));

  lines.push(`\n🔎 Identified ${clusters.length} suspicion clusters.`);
  lines.push("\n📊 Ranked Creator Cluster Scores:\n");

  const top = scores[0];
  const targetIndex = scores.findIndex(s => s.creator === creatorInput);
  const target = targetIndex !== -1 ? scores[targetIndex] : null;

  if (top) {
    lines.push(`#1  🧑‍💻 ${top.creator} → Clusters: ${top.clusterCount} | Cluster Size: ${top.clusterSize}`);
  }

  if (target) {
    const rank = targetIndex + 1;
    lines.push(`#${rank}  🧑‍💻 ${target.creator} → Clusters: ${target.clusterCount} | Cluster Size: ${target.clusterSize}`);
  } else {
    lines.push(`❌ No clusters found for ${creatorInput}`);
  }

  return res.status(200).json({ output: lines.join("\n") });
}











































