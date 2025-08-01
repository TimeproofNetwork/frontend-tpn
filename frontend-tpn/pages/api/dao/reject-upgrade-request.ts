import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// ✅ Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const registryABI = JSON.parse(
  fs.readFileSync("artifacts/contracts/TokenRegistry.sol/TokenRegistry.json", "utf-8")
).abi;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("📩 Incoming request to /api/dao/reject-upgrade-request");

  if (req.method !== "POST") {
    console.error("❌ Invalid method:", req.method);
    return res.status(405).json({ output: "❌ Only POST allowed." });
  }

  const { tokenAddress } = req.body;

  if (!tokenAddress) {
    console.error("❌ tokenAddress missing in body.");
    return res.status(400).json({ output: "❌ Token address is required." });
  }

  try {
    console.log("🔐 Connecting to RPC provider...");
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

    console.log("🔑 Instantiating signer with PRIVATE_KEY...");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

    console.log("🏛️ Instantiating TokenRegistry contract at:", TOKEN_REGISTRY);
    const Registry = new ethers.Contract(TOKEN_REGISTRY, registryABI, wallet);

    const checksummedAddress = ethers.utils.getAddress(tokenAddress.toLowerCase());
    console.log("📌 Target token (checksummed):", checksummedAddress);

    console.log("🚨 Calling daoRejectTrustLevelUpgrade()...");
    const tx = await Registry.daoRejectTrustLevelUpgrade(checksummedAddress);
    console.log("⏳ Waiting for transaction confirmation:", tx.hash);
    await tx.wait();

    console.log("✅ Rejection confirmed.");
    return res.status(200).json({
      output: `❌ Upgrade request rejected for token at ${checksummedAddress}`,
    });
  } catch (err: any) {
    const reason = err?.reason || err?.error?.message || err.message || "Unknown error";
    console.error("❌ Rejection failed:", reason);
    return res.status(500).json({ output: `❌ Rejection failed: ${reason}` });
  }
}


