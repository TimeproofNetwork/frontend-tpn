import { ethers } from "ethers";
import TokenRegistry from "@/abi/TokenRegistry.json";
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const TokenRegistryAbi = TokenRegistry.abi;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const limit = Number(req.query.limit || 10);

  try {
    const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistryAbi, provider);
    const logbook = await registry.getTokenLogbook();

    // Batch map over recent tokens
    const entries = await Promise.all(
      logbook
        .slice(-limit)
        .reverse()
        .map(async (entry: any) => {
          const name = entry.name;
          const symbol = entry.symbol;
          const trustLevel = Number(entry.trustLevel);

          // ✅ Check if DAO banned
          const isDAOBanned = await registry.isDAOPunished(name, symbol);

          // Override if DAO banned
          const finalTrustLevel = isDAOBanned ? 0 : trustLevel;
          const trustIcons = ["⚫", "🟡", "🟢", "🟣"];
          const trustText = ["Level 0", "Level 1", "Level 2", "Level 3"];
          const levelDisplay = `${trustIcons[finalTrustLevel] || "⚫"} ${trustText[finalTrustLevel] || "Level 0"}`;

          return {
            name,
            symbol,
            token: entry.tokenAddress,
            creator: entry.registeredBy,
            timestamp: new Date(Number(entry.timestamp) * 1000).toISOString(),
            trustLevel: finalTrustLevel,
            trustLevelDisplay: levelDisplay,
            isDAOBanned, // ✅ frontend can flag this
          };
        })
    );

    res.status(200).json({ tokens: entries });
  } catch (err: any) {
    console.error("❌ Failed to fetch registry tokens:", err);
    res.status(500).json({ tokens: [], error: err.message });
  }
}


