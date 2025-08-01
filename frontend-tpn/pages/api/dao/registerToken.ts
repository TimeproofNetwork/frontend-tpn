import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
// @ts-ignore
import TokenRegistry from "@/abi/TokenRegistry.json";
import { appendTicket } from "@/lib/dao/ticketUtils";

const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY as string, provider);
const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      symbol,
      trustLevel,
      proof1,
      proof2,
      creator // this must be passed from frontend
    } = req.body;

    if (!name || !symbol || trustLevel === undefined || !creator) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistry.abi, signer);

    const tx = await registry.registerToken(name, symbol, trustLevel, proof1 || "", proof2 || "");
    const receipt = await tx.wait();

    const event = receipt.events?.find((e: any) => e.event === "TokenRegistered");
    const registeredTokenAddress = event?.args?.token;

    // ✅ Append N-type ticket if L2 or L3
    if (Number(trustLevel) >= 2) {
      appendTicket({
        type: "N",
        name,
        symbol,
        address: registeredTokenAddress,
        proofs: {
          ...(proof1 && { proof1 }),
          ...(proof2 && { proof2 }),
        },
        status: "pending",
        timestamp: new Date().toISOString(),
        requester: creator,
      });
    }

    return res.status(200).json({
      success: true,
      txHash: tx.hash,
      tokenAddress: registeredTokenAddress,
    });
  } catch (error: any) {
    console.error("❌ Token registration failed:", error);
    return res.status(500).json({ error: error.message || "Registration failed" });
  }
}







