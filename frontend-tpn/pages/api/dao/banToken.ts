// pages/api/dao/banToken.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import TokenRegistry from "@/abi/TokenRegistry.json";
const TokenRegistryAbi = TokenRegistry.abi;

import dotenv from "dotenv";
dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST allowed." });
  }

  const { address, reason } = req.body;
  if (!address || !reason) {
    return res.status(400).json({ output: "❌ Address and reason required." });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY as string, provider);
    const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
    const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistryAbi, provider);

    const tx = await registry.daoBanToken(address, reason);
    await tx.wait();

    res.status(200).json({ output: `✅ Token banned.\nTx Hash: ${tx.hash}` });
  } catch (err: any) {
    res.status(500).json({ output: `❌ Error: ${err.reason || err.message}` });
  }
}
