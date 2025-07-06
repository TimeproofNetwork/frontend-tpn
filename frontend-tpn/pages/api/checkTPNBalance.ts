import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import dotenv from "dotenv";
import TPN_ABI from "@/utils/TPN_ABI.json";

dotenv.config();

const TPN_TOKEN_ADDRESS = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST method is allowed." });
  }

  const { wallet } = req.body;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!wallet || !rpcUrl) {
    return res.status(400).json({ output: "❌ Wallet address or RPC URL missing!" });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const token = new ethers.Contract(TPN_TOKEN_ADDRESS, TPN_ABI, provider);
    const rawBalance = await token.balanceOf(wallet);

    // ✅ Hardcoded 18 decimals — no decimals() call
    const balance = parseFloat(ethers.utils.formatUnits(rawBalance, 18));

    return res.status(200).json({ balance });
  } catch (err: any) {
    console.error("❌ Error:", err);
    return res.status(500).json({
      output: `❌ Failed to fetch TPN balance.\n\n${err.message || String(err)}`
    });
  }
}









