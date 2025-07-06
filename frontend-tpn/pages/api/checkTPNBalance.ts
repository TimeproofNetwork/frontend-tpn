// /pages/api/checkTPNBalance.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import dotenv from "dotenv";
import TPN_ABI from "@/utils/TPN_ABI.json";  // ✅ Already pure ABI array, no .abi needed

dotenv.config();

const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";  // ✅ Your deployed TPN Token address on Sepolia

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST method is allowed." });
  }

  const { wallet } = req.body;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!wallet || !rpcUrl) {
    return res.status(400).json({ output: "❌ Wallet address or RPC URL missing." });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(TPN_TOKEN, TPN_ABI, provider);  // ✅ Fixed: use TPN_ABI directly (no .abi)

    const balance = await contract.balanceOf(wallet);
    const decimals = await contract.decimals();
    const formatted = parseFloat(ethers.utils.formatUnits(balance, decimals));

    if (formatted >= 100) {
      return res.status(200).json({ output: `✅ Wallet has ${formatted} TPN.` });
    } else {
      return res.status(200).json({ output: `❌ Insufficient TPN: You have ${formatted} TPN. Minimum 100 TPN required.` });
    }

  } catch (error: any) {
    return res.status(500).json({ output: `❌ Failed to fetch TPN balance.\n\n${error.message || String(error)}` });
  }
}




