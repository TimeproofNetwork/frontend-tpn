// /pages/api/dao/transferTPN.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";
import TPNToken from "@/abi/TPNToken.json"; // ✅ ABI still loaded locally

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { recipient, amount } = req.body;

  // Basic validation
  if (!ethers.utils.isAddress(recipient)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Invalid transfer amount" });
  }

  try {
    // 🔍 Fetch token address from Supabase
    const { data, error } = await supabase
      .from("tpn_token_meta")
      .select("address")
      .eq("symbol", "TPN")
      .single();

    if (error || !data) {
      throw new Error("TPN token metadata not found in Supabase");
    }

    // ✅ Provider and signer setup
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

    // ✅ Contract setup using Supabase address and local ABI
    const token = new ethers.Contract(data.address, TPNToken.abi, signer);

    const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);
    console.log(`⏳ Sending ${amount} TPN to ${recipient}...`);

    const tx = await token.transfer(recipient, parsedAmount);
    await tx.wait();

    console.log(`✅ Successfully sent ${amount} TPN`);
    console.log(`📦 Tx Hash: ${tx.hash}`);

    return res.status(200).json({
      success: true,
      message: `Sent ${amount} TPN to ${recipient}`,
      txHash: tx.hash,
    });
  } catch (err: any) {
    console.error("❌ Transfer error:", err);
    return res.status(500).json({ error: err.message || "Transfer failed" });
  }
}




