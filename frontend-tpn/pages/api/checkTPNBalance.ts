// ✅ /pages/api/checkTPNBalance.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import dotenv from "dotenv";
import TPN_ABI from "@/utils/TPN_ABI.json";

dotenv.config();

const TPN_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TPN_TOKEN!;
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!;  // ✅ Fix: Use NEXT_PUBLIC_SEPOLIA_RPC_URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST method is allowed." });
  }

  const { wallet } = req.body;

  if (!wallet || !RPC_URL || !TPN_TOKEN_ADDRESS) {
    return res.status(400).json({ output: "❌ Wallet, Token Address, or RPC URL missing!" });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const token = new ethers.Contract(TPN_TOKEN_ADDRESS, TPN_ABI, provider);
    const rawBalance = await token.balanceOf(wallet);

    // ✅ Hardcoded decimals = 18 (do not call decimals() anywhere)
    const balance = parseFloat(ethers.utils.formatUnits(rawBalance, 18));

    return res.status(200).json({ balance });
  } catch (err: any) {
    console.error("❌ TPN Balance Fetch Error:", err);
    return res.status(500).json({
      output: `❌ Failed to fetch TPN balance.\n\n${err.message || String(err)}`
    });
  }
}














