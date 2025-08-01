import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// ✅ Inline sanitizeInput (CIS-style)
function sanitizeInput(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .trim();
}

// ✅ Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const registryABI = JSON.parse(
  fs.readFileSync("artifacts/contracts/TokenRegistry.sol/TokenRegistry.json", "utf-8")
).abi;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("📩 Incoming request to /api/dao/approve-upgrade-request");

  if (req.method !== "POST") {
    console.error("❌ Invalid method:", req.method);
    return res.status(405).json({ output: "❌ Only POST allowed." });
  }

  const { name, symbol, tokenAddress, proof1, proof2, newLevel } = req.body;

  if (!name || !symbol || !tokenAddress || !proof1 || !newLevel) {
    console.error("❌ Missing fields:", { name, symbol, tokenAddress, proof1, newLevel });
    return res.status(400).json({ output: "❌ Missing required fields." });
  }

  try {
    console.log("🔐 Connecting to Sepolia provider...");
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

    console.log("🔑 Creating signer from PRIVATE_KEY...");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

    console.log("🏛️ Connecting to TokenRegistry at:", TOKEN_REGISTRY);
    const Registry = new ethers.Contract(TOKEN_REGISTRY, registryABI, wallet);

    const sanitizedName = sanitizeInput(name);
    const sanitizedSymbol = sanitizeInput(symbol);
    const checksummedAddress = ethers.utils.getAddress(tokenAddress.toLowerCase());

    console.log("🧼 Sanitized Name:", sanitizedName);
    console.log("🧼 Sanitized Symbol:", sanitizedSymbol);
    console.log("📌 Target Token:", checksummedAddress);
    console.log("🔗 Proof1:", proof1);
    console.log("🔗 Proof2:", proof2 || "N/A");
    console.log("🎯 Target Level:", newLevel);

    console.log("🚀 Calling daoUpgradeTrustLevel...");
    const tx = await Registry.daoUpgradeTrustLevel(
      checksummedAddress,
      newLevel,
      proof1,
      proof2 || ""
    );
    console.log("⏳ Waiting for transaction:", tx.hash);
    await tx.wait();

    console.log(`✅ Upgrade approved: ${sanitizedName} (${sanitizedSymbol}) → Level ${newLevel}`);
    return res.status(200).json({
      output: `✅ Upgrade approved for ${sanitizedName} (${sanitizedSymbol}) → Level ${newLevel}`,
    });
  } catch (err: any) {
    const reason = err?.reason || err?.error?.message || err.message || "Unknown error";
    console.error("❌ Upgrade failed:", reason);
    return res.status(500).json({ output: `❌ Upgrade failed: ${reason}` });
  }
}



