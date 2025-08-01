// pages/api/dao/checkQuarantineStatus.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistry from "@/abi/TokenRegistry.json";

function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getFingerprint(name: string, symbol: string): string {
  const unified = sanitize(name) + sanitize(symbol);
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(unified));
}

const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!;
const REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY!;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const registry = new ethers.Contract(REGISTRY, TokenRegistry.abi, provider);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { input } = req.body;

  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "Missing or invalid input" });
  }

  try {
    let fingerprint = "";
    let name = "";
    let symbol = "";

    if (ethers.utils.isAddress(input)) {
      const info = await registry.getTokenInfo(input);
      name = info.name;
      symbol = info.symbol;
      fingerprint = getFingerprint(name, symbol);

      const isQuarantined = await registry.quarantineList(fingerprint);

      return res.status(200).json({
        type: "address",
        address: input,
        name,
        symbol,
        creator: info.creator,
        trustLevel: info.trustLevel,
        registered: info.isRegistered,
        fingerprint,
        quarantined: isQuarantined
      });
    }

    if (input.includes("+")) {
      const [rawName, rawSymbol] = input.split("+");
      name = rawName;
      symbol = rawSymbol;

      const sanitizedName = sanitize(name);
      const sanitizedSymbol = sanitize(symbol);
      fingerprint = getFingerprint(name, symbol);

      const isQuarantined = await registry.quarantineList(fingerprint);

      return res.status(200).json({
        type: "name+symbol",
        name,
        symbol,
        sanitizedName,
        sanitizedSymbol,
        fingerprint,
        quarantined: isQuarantined
      });
    }

    return res.status(400).json({ error: "Invalid input format" });
  } catch (err: any) {
    console.error("❌ Quarantine API Error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}





