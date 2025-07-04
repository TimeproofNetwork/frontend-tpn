// /pages/api/scanCreatorTrustScore.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistryAbi from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

type Data = {
  output?: string;
  error?: string;
};

const TPN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Only POST method is allowed." });
  }

  const creator = req.body.creator?.trim();
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!creator || !rpcUrl) {
    return res.status(400).json({
      error: "❌ Creator address or RPC URL missing from request or environment!",
    });
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const registry = new ethers.Contract(TPN_REGISTRY, TokenRegistryAbi.abi, provider);

  let trustLevel = 0;

  try {
    const trustDetails = await registry.getTrustDetails(creator);
    trustLevel = parseInt(trustDetails.toString());
  } catch (err: any) {
    return res.status(500).json({
      error: `❌ Failed to fetch creator trust level.\n\n${err.message || String(err)}`,
    });
  }

  const trustIcons = ["⚫", "🟡", "🟢", "🟣"];
  const trustTexts = ["Level 0", "Level 1", "Level 2", "Level 3"];

  const outputLines: string[] = [];
  outputLines.push(`🔎 Scanning Creator Address: ${creator}`);
  outputLines.push(`\n🔒 Trust Level: ${trustIcons[trustLevel] || "⚫"} ${trustTexts[trustLevel] || "Level 0"}`);

  if (trustLevel === 0) {
    outputLines.push(`\n📉 This creator has no verified trust level.`);
  } else if (trustLevel === 1) {
    outputLines.push(`\n🟡 Level 1: Basic Trust. Proceed with caution.`);
  } else if (trustLevel === 2) {
    outputLines.push(`\n🟢 Level 2: Verified Exchange. Low Risk.`);
  } else if (trustLevel === 3) {
    outputLines.push(`\n🟣 Level 3: Full Audit Verified. High Trust.`);
  }

  return res.status(200).json({ output: outputLines.join("\n") });
}















