import { ethers } from "ethers";
import TokenRegistry from "@/abi/TokenRegistry.json";
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config();

const TokenRegistryAbi = TokenRegistry.abi;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const rawCreator = req.query.creator;

  if (!rawCreator || typeof rawCreator !== "string" || !rawCreator.startsWith("0x")) {
    return res.status(400).json({ tokens: [], error: "Invalid creator address." });
  }

  const creator = rawCreator.toLowerCase();

  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
    const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistryAbi, provider);

    const logbook = await registry.getTokenLogbook();

    const tokens = await Promise.all(
      logbook
        .filter((entry: any) => entry[3].toLowerCase() === creator)
        .map(async (entry: any) => {
          const name = entry[0];
          const symbol = entry[1];
          const address = entry[2];
          const trustLevelRaw = Number(entry[7]);

          // 🔍 Check DAO ban status using name + symbol
          const isDAOBanned = await registry.isDAOPunished(name, symbol);

          const trustLevel = isDAOBanned ? 0 : trustLevelRaw;

          const trustIcons = ["⚫", "🟡", "🟢", "🟣"];
          const trustText = ["Level 0", "Level 1", "Level 2", "Level 3"];
          const trustLevelDisplay = `${trustIcons[trustLevel] || "⚫"} ${trustText[trustLevel] || "Level 0"}`;

          return {
            name,
            symbol,
            address,
            creator: entry[3],
            timestamp: new Date(Number(entry[4]) * 1000).toISOString(),
            trustLevel,
            trustLevelDisplay,
            isDAOBanned,
          };
        })
    );

    res.status(200).json({ tokens });
  } catch (err: any) {
    res.status(500).json({ tokens: [], error: err.message });
  }
}





