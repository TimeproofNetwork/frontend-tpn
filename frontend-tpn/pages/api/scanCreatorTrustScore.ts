// pages/api/scanCreatorTrustScore.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";
import levenshtein from "fast-levenshtein";

dotenv.config();

const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const RPC_URL = process.env.SEPOLIA_RPC_URL;

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
      if (isSuspicious(token, prior)) {
        const dist = levenshtein.get(unified(token.name, token.symbol), unified(prior.name, prior.symbol));
        if (dist <= 3) {
          if (token.symbol.length <= 3) {
            penalty += 10;
          } else {
            penalty += 25;
          }
          suspiciousCount++;
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































































