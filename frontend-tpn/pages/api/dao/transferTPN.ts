import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TPNToken from "@/abi/TPNToken.json"; // ✅ Import full artifact

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
    // ✅ Provider and signer setup
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

    // ✅ Contract setup with ABI-only reference
    const TPN_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TPN_TOKEN as `0x${string}`;
    const token = new ethers.Contract(TPN_TOKEN_ADDRESS, TPNToken.abi, signer);

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



