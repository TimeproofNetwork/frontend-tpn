// /pages/api/dao/checkDaoBanStatus.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistry from "@/abi/TokenRegistry.json";

const TokenRegistryAbi = TokenRegistry.abi;

const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistryAbi, provider);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const input = (req.body.input as string)?.trim();
    if (!input) {
      return res.status(400).json({ error: "Missing input" });
    }

    // Check if input is an address
    if (ethers.utils.isAddress(input)) {
      const address = input;

      const [
        name,
        symbol,
        tokenAddr,
        creator,
        timestamp,
        proof1,
        proof2,
        trustLevel,
        isRegistered
      ] = await registry.getTokenInfo(address);

      if (!isRegistered) {
        throw new Error("Token not registered");
      }

      // ✅ Type-safe ban check
      const banned = await registry.isDAOPunished(name, symbol);

      return res.status(200).json({
        type: "address",
        address,
        name,
        symbol,
        creator,
        trustLevel,
        registered: isRegistered,
        fingerprint: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name + symbol)),
        banned
      });
    }

    // If input is not address, treat as name+symbol string
    const parts = input.split("+");
    if (parts.length !== 2) {
      return res.status(400).json({ error: "Invalid name+symbol format" });
    }

    const [name, symbol] = parts.map(part => part.trim());

    if (!name || !symbol) {
      return res.status(400).json({ error: "Missing name or symbol" });
    }

    const banned = await registry.isDAOPunished(name, symbol);

    return res.status(200).json({
      type: "name+symbol",
      name,
      symbol,
      banned
    });

  } catch (err: any) {
    console.error("❌ DAO Ban Check Failed:", err);
    return res.status(500).json({ error: "Internal error", banned: "error" });
  }
}




















