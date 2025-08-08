import type { NextApiRequest, NextApiResponse } from "next";
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
  const registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, provider);

  const nameSan = sanitize(rawName);
  const symbolSan = sanitize(rawSymbol);
  const unifiedInput = unified(nameSan, symbolSan);

  let tokens: any[] = [];
  try {
    const rawTokens = await registry.getTokenLogbook();
    tokens = rawTokens.map((token: any, index: number) => ({ ...token, index }));
    tokens.sort((a: any, b: any) => a.timestamp - b.timestamp);
  } catch (err: any) {
    return res.status(500).json({ output: `❌ Failed to fetch tokens from registry.\n${err.message || String(err)}` });
  }

  const inputIndex = tokens.findIndex(t => sanitize(t.name) === nameSan && sanitize(t.symbol) === symbolSan);

  const isRegistered = inputIndex !== -1;
  const inputToken = isRegistered ? tokens[inputIndex] : {
    name: nameSan,
    symbol: symbolSan,
    tokenAddress: undefined,
    registeredBy: "Unregistered",
    timestamp: undefined,
    index: -1,
  };

  try {
    const isDaoBanned = await registry.isDAOPunished(nameSan, symbolSan);
    if (isDaoBanned) {
      return res.status(200).json({
        output: [
          `🔎 Scanning Token: ${rawName} (${rawSymbol})`,
          `📦 Address: ${inputToken.tokenAddress ?? "Unregistered"}`,
          `🧑 Creator: ${inputToken.registeredBy}`,
          `📅 Registered: ${inputToken.timestamp ? new Date(Number(inputToken.timestamp) * 1000).toLocaleString("en-US") : "Unregistered"}`,
          `🔒 Trust Level: ⚫ Level 0`,
          `⚫ Recommendation: Token is DAO Banned.`
        ].join("\n")
      });
    }
  } catch (_) {}

  let trustLevel = -1;
  try {
    if (isRegistered && inputToken.tokenAddress) {
      const trustDetails = await registry.getTrustDetails(inputToken.tokenAddress);
      trustLevel = parseInt(trustDetails.trustLevel || trustDetails[0]);
    }
  } catch (_) {}

  const trustIcons = ["⚫", "🟡", "🟢", "🟣"];
  const trustText = ["Level 0", "Level 1", "Level 2", "Level 3"];
  const trustIcon = trustLevel >= 0 ? trustIcons[trustLevel] : "⚪";
  const trustLabel = trustLevel >= 0 ? trustText[trustLevel] : "Level — Undefined";

  const baseLines = [
    `🔎 Scanning Token: ${rawName} (${rawSymbol})`,
    `📦 Address: ${inputToken.tokenAddress ?? "Unregistered"}`,
    `🧑 Creator: ${inputToken.registeredBy}`,
    `📅 Registered: ${inputToken.timestamp ? new Date(Number(inputToken.timestamp) * 1000).toLocaleString("en-US") : "Unregistered"}`,
    `🔒 Trust Level: ${trustIcon} ${trustLabel}`
  ];

  const candidates = tokens.filter(t => {
    if (!t.timestamp || (inputToken.timestamp && t.timestamp >= inputToken.timestamp)) return false;
    return levenshtein.get(unifiedInput, unified(t.name, t.symbol)) <= 3;
  }).map(t => {
    const totalEdit = levenshtein.get(unifiedInput, unified(t.name, t.symbol));
    return { ...t, totalEdit };
  });

  candidates.sort((a, b) => a.totalEdit !== b.totalEdit ? a.totalEdit - b.totalEdit : a.timestamp - b.timestamp);
  const root = candidates[0];

  if (!root) {
    return res.status(200).json({
      output: [
        ...baseLines,
        `✅ No suspicious tokens found. Safe to proceed.`
      ].join("\n")
    });
  }

  const baseCluster = tokens.filter(t => levenshtein.get(unified(root.name, root.symbol), unified(t.name, t.symbol)) <= 3);
  const uniqueCluster = Array.from(new Map(baseCluster.map(t => [unified(t.name, t.symbol), t])).values());

  const closest = uniqueCluster.filter(t => t.index !== root.index && t.index !== inputToken.index)
  .reduce((closest, curr) => {
    const dist = levenshtein.get(unified(root.name, root.symbol), unified(curr.name, curr.symbol));
    const currDist = closest ? levenshtein.get(unified(root.name, root.symbol), unified(closest.name, closest.symbol)) : Infinity;
    if (dist < currDist || (dist === currDist && curr.timestamp < closest.timestamp)) {
      return curr;
    }
    return closest;
  }, null);

  const lastMember = uniqueCluster.reduce((latest, curr) => curr.timestamp > latest.timestamp ? curr : latest, uniqueCluster[0]);

  const inputDisplay = isRegistered
    ? `📌 Input Token: ${inputToken.name} (${inputToken.symbol}) | Registered at #${inputToken.index}`
    : `📌 Input Token: ${nameSan} (${symbolSan}) | Registered at Unregistered`;

  const lines: string[] = [...baseLines];
  lines.push(`\n🧠 Suspicion Cluster Detected (${uniqueCluster.length} tokens)`);
  lines.push(`✅ Base Token: ${root.name} (${root.symbol}) | Registered at #${root.index}`);
  lines.push(inputDisplay);
  lines.push(`📍 Closest Token: ${closest?.name ?? "N/A"} (${closest?.symbol ?? "N/A"}) | Registered at #${closest?.index ?? "Unregistered"}`);
  lines.push(`🧩 Last Member: ${lastMember.name} (${lastMember.symbol}) | Registered at #${lastMember.index}`);
  lines.push(`\n🚨 Recommendation: DEX Listing Risk – Review cluster before proceeding.`);

  return res.status(200).json({ output: lines.join("\n") });
}

















































