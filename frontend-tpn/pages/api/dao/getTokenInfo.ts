// /pages/api/getTokenInfo.ts

import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistry from "@/abi/TokenRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// ✅ Canonical TPN Sanitization (CIS Standard)
function sanitize(str: string): string {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Only POST method allowed." });
  }

  try {
    const { tokenAddress, name, symbol } = req.body;
    const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistry.abi, provider);

    // ✅ Method 1: Direct lookup by tokenAddress
    if (tokenAddress) {
      const result = await registry.getTokenInfo(tokenAddress);

      const tokenName = result[0];
      const tokenSymbol = result[1];
      const tokenAddressConfirmed = tokenAddress;
      const registeredBy = result[3]; // registeredBy = creator
      const timestamp = result[4]?.toNumber?.() ?? 0;
      const trustLevel = result[7] ?? 0;

      return res.status(200).json({
        name: tokenName,
        symbol: tokenSymbol,
        creator: registeredBy,
        timestamp,
        trustLevel,
        tokenAddress: tokenAddressConfirmed,
        fingerprint: {
          name: sanitize(tokenName),
          symbol: sanitize(tokenSymbol)
        }
      });
    }

    // ✅ Method 2: Fallback to name+symbol lookup
    if (!name || !symbol) {
      return res.status(400).json({ error: "❌ name or symbol required if tokenAddress is missing." });
    }

    const tokens = await registry.getTokenLogbook();
    const inputName = sanitize(name);
    const inputSymbol = sanitize(symbol);

    for (const token of tokens) {
      const regName = sanitize(token[0]);  // token.name
      const regSymbol = sanitize(token[1]); // token.symbol

      if (regName === inputName && regSymbol === inputSymbol) {
        return res.status(200).json({
          name: token[0],              // name
          symbol: token[1],            // symbol
          tokenAddress: token[2],      // tokenAddress
          creator: token[3],           // registeredBy (creator)
          timestamp: token[4]?.toNumber?.() ?? 0, // timestamp
          trustLevel: token[7] ?? 0,    // trustLevel
          fingerprint: {
            name: regName,
            symbol: regSymbol
          }
        });
      }
    }

    return res.status(404).json({ error: "❌ No matching token found in registry." });

  } catch (err: any) {
    console.error("❌ getTokenInfo error:", err.message || err);
    return res.status(500).json({ error: "❌ Internal server error." });
  }
}











