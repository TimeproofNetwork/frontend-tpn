import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const RPC_URL = process.env.SEPOLIA_RPC_URL;

function convertUnicodeToAscii(str: string): string {
  return str.normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function sanitizeInput(str: string): string {
  return convertUnicodeToAscii(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function isSC(input: any, prior: any): boolean {
  const n1 = sanitizeInput(input.name);
  const n2 = sanitizeInput(prior.name);
  const s1 = sanitizeInput(input.symbol);
  const s2 = sanitizeInput(prior.symbol);
  return s1.length <= 3 && editDistance(n1, n2) <= 3 && editDistance(s1, s2) <= 2;
}

function isLSIC(input: any, prior: any): boolean {
  const s1 = sanitizeInput(input.symbol);
  if (s1.length <= 3) return false;
  const id1 = sanitizeInput(input.name + input.symbol);
  const id2 = sanitizeInput(prior.name + prior.symbol);
  return editDistance(id1, id2) <= 2;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST method is allowed." });
  }

  const creator = req.body.creator?.trim().toLowerCase();

  if (!creator || !RPC_URL) {
    return res.status(400).json({ output: "❌ Creator address or RPC URL missing from request or environment!" });
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);

  let tokens: any[] = [];
  try {
    const rawTokens = await registry.getTokenLogbook();
    tokens = rawTokens.map((token: any, index: number) => ({
      name: token.name,
      symbol: token.symbol,
      address: token.tokenAddress,
      creator: token.registeredBy.toLowerCase(),
      timestamp: token.timestamp ? Number(token.timestamp.toString()) : 0,
      index,
    }));
    tokens.sort((a, b) => a.timestamp - b.timestamp);
  } catch (err: any) {
    return res.status(500).json({ output: `❌ Failed to fetch token logbook.\n\n${err.message || String(err)}` });
  }

  const creatorTokens = tokens.filter(t => t.creator === creator);

  const lines: string[] = [];
  lines.push(`\n🔍 Suspicion Scan started by: ${creator}`);
  lines.push(`📚 Fetching registered tokens from logbook...`);
  lines.push(`✅ Fetched ${tokens.length} tokens from registry.`);
  lines.push(`📦 Total tokens created: ${creatorTokens.length}\n`);

  if (creatorTokens.length === 0) {
    lines.push(`❌ No tokens found for creator: ${creator}`);
    return res.status(200).json({ output: lines.join("\n") });
  }

  let suspiciousCount = 0;
  let penalty = 0;

  creatorTokens.forEach(token => {
    const priorTokens = tokens.filter(t => t.timestamp < token.timestamp);
    for (const prior of priorTokens) {
      if (token.symbol.length <= 3) {
        if (isSC(token, prior)) {
          suspiciousCount++;
          penalty += 10;
          break;
        }
      } else {
        if (isLSIC(token, prior)) {
          suspiciousCount++;
          penalty += 25;
          break;
        }
      }
    }
  });

  const trustScore = Math.max(0, 100 - penalty);

  lines.push(`✏️ Suspicious tokens found: ${suspiciousCount}`);
  lines.push(`📊 Estimated Trust Score: ${trustScore}/100`);

  if (trustScore >= 90) {
    lines.push(`✅ Creator is highly trustworthy.`);
  } else if (trustScore >= 60) {
    lines.push(`⚠️ Moderate risk. Review token lineage.`);
  } else {
    lines.push(`🚨 High risk. Creator may be deploying clones.`);
  }

  return res.status(200).json({ output: lines.join("\n") });
}




























































