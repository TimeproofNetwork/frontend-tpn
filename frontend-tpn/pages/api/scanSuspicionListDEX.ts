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
  const isSC = symbolSan.length <= 3;

  let tokens: any[] = [];
  try {
    const rawTokens = await registry.getTokenLogbook();
    tokens = rawTokens.map((token: any, index: number) => ({ ...token, index }));
    tokens.sort((a: any, b: any) => a.timestamp - b.timestamp);
  } catch (err: any) {
    return res.status(500).json({ output: `❌ Failed to fetch tokens from registry.\n${err.message || String(err)}` });
  }

  const inputIndex = tokens.findIndex(t => sanitize(t.name) === nameSan && sanitize(t.symbol) === symbolSan);
  const inputToken = inputIndex !== -1 ? tokens[inputIndex] : {
    name: nameSan,
    symbol: symbolSan,
    tokenAddress: "❓ (Unregistered)",
    registeredBy: "undefined",
    timestamp: undefined,
    index: -1,
  };

  let trustLevel = 0;
  try {
    if (inputToken.tokenAddress !== "❓ (Unregistered)") {
      const trustDetails = await registry.getTrustDetails(inputToken.tokenAddress);
      trustLevel = parseInt(trustDetails.trustLevel || trustDetails[0]);
    }
  } catch (_) {}

  const trustIcons = ["⚫", "🟡", "🟢", "🟣"];
  const trustText = ["Level 0", "Level 1", "Level 2", "Level 3"];

  const baseLines = [
    `🔎 Scanning Token: ${rawName} (${rawSymbol})`,
    `📦 Address: ${inputToken.tokenAddress}`,
    `🧑 Creator: ${inputToken.registeredBy}`,
    `📅 Registered: ${inputToken.timestamp ? new Date(inputToken.timestamp * 1000).toLocaleString("en-US") : "Unregistered"}`,
    `🔒 Trust Level: ${trustIcons[trustLevel] || "⚫"} ${trustText[trustLevel] || "Level 0"}`
  ];

  // ✅ If DAO Banned (trustLevel 0) → Skip all suspicion logic
  if (trustLevel === 0) {
    baseLines.push(`☠️ Caution — Token is DAO Banned.`);
    return res.status(200).json({ output: baseLines.join("\n") });
  }

  const candidates = tokens.filter(t => {
    if (t.index === inputToken.index) return false;
    if (!t.timestamp || (inputToken.timestamp && t.timestamp >= inputToken.timestamp)) return false;

    const nameDist = levenshtein.get(nameSan, sanitize(t.name));
    const symDist = levenshtein.get(symbolSan, sanitize(t.symbol));
    const uniDist = levenshtein.get(unifiedInput, unified(t.name, t.symbol));

    return isSC ? (nameDist <= 3 && symDist <= 2) : uniDist <= 2;
  }).map(t => {
    const totalEdit = isSC
      ? levenshtein.get(nameSan, sanitize(t.name)) + levenshtein.get(symbolSan, sanitize(t.symbol))
      : levenshtein.get(unifiedInput, unified(t.name, t.symbol));
    return { ...t, totalEdit };
  });

  if (candidates.length === 0) {
    const isDAOBlocked = await registry.isDAOPunished(nameSan, symbolSan);
  if (isDAOBlocked) {
    return res.status(200).json({
      output: [
        `🔎 Scanning Token: ${rawName} (${rawSymbol})`,
        `📦 Address: ${inputToken.tokenAddress}`,
        `🧑 Creator: ${inputToken.registeredBy}`,
        `📅 Registered: ${inputToken.timestamp ? new Date(inputToken.timestamp * 1000).toLocaleString("en-US") : "Unregistered"}`,
        `🔒 Trust Level: ⚫ Level 0`,
        `☠️ Caution — Token is DAO Banned.`
      ].join("\n")
    });
  }
    return res.status(200).json({
      output: [
        ...baseLines,
        `✅ No suspicious tokens found. Safe to proceed.`
      ].join("\n")
    });
  }

  candidates.sort((a, b) => a.totalEdit !== b.totalEdit ? a.totalEdit - b.totalEdit : a.timestamp - b.timestamp);
  const root = candidates[0];

  const cluster = tokens.filter(t => isSuspicious(t, root));
  const unique = new Map(cluster.map(t => [unified(t.name, t.symbol), t]));
  const all = Array.from(unique.values());

  if (!all.find(t => t.index === inputToken.index) && inputToken.index !== -1) {
    all.push(inputToken);
  }

  const registeredInput = tokens.find(t => sanitize(t.name) === nameSan && sanitize(t.symbol) === symbolSan);
  const inputDisplay = registeredInput
    ? `📌 Input Token: ${registeredInput.name} (${registeredInput.symbol}) | Registered at #${registeredInput.index}`
    : `📌 Input Token: ${sanitize(rawName)} (${sanitize(rawSymbol)}) | Unregistered`;

  let closest = null, minEdit = Infinity;
  for (const t of all) {
    if (t.index === root.index) continue;
    const dist = isSC
      ? levenshtein.get(sanitize(root.name), sanitize(t.name)) + levenshtein.get(sanitize(root.symbol), sanitize(t.symbol))
      : levenshtein.get(unified(root.name, root.symbol), unified(t.name, t.symbol));
    if (dist < minEdit || (dist === minEdit && (!closest || t.timestamp < closest.timestamp))) {
      minEdit = dist;
      closest = t;
    }
  }

  const lastMember = all.reduce((latest, curr) => curr.timestamp > latest.timestamp ? curr : latest, all[0]);

  const lines: string[] = [...baseLines];
  lines.push(`\n🧠 Suspicion Cluster Detected (${all.length} tokens)`);
  lines.push(`✅ Base Token: ${root.name} (${root.symbol}) | Registered at #${root.index}`);
  lines.push(inputDisplay);
  lines.push(`📍 Closest Token: ${closest?.name} (${closest?.symbol}) | Registered at #${closest?.index}`);
  lines.push(`🧩 Last Member: ${lastMember.name} (${lastMember.symbol}) | Registered at #${lastMember.index}`);
  lines.push(`\n🚨 Recommendation: DEX Listing Risk – Review cluster before proceeding.`);

  return res.status(200).json({ output: lines.join("\n") });
}








































