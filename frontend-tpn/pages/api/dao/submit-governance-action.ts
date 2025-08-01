import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
// @ts-ignore
import TokenRegistry from '@/abi/TokenRegistry.json';
import { appendTicket } from '@/lib/dao/ticketUtils';

const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as string;
const signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { actionName, description, name, symbol, address, proof1, proof2, requester } = req.body;

    if (!actionName || !description || !name || !symbol || !address || !requester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistry.abi, signer);

    const tx = await registry.submitGovernanceAction(actionName, description);
    await tx.wait();

    // ✅ Append E-type ticket to dao-tickets.json
    appendTicket({
      type: "E",
      name,
      symbol,
      address,
      proofs: {
        ...(proof1 && { proof1 }),
        ...(proof2 && { proof2 }),
      },
      status: "pending",
      timestamp: new Date().toISOString(),
      requester,
    });

    return res.status(200).json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    console.error("❌ Governance action submission failed:", error);
    return res.status(500).json({ error: error.message || "Submission failed" });
  }
}

