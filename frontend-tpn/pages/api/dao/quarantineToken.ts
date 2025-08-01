// pages/api/dao/quarantineToken.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import TokenRegistryABI from '@/abi/TokenRegistry.json';
import sanitizeInput from '@/utils/sanitizeInputs';

const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const RPC_URL = process.env.SEPOLIA_RPC_URL as string;
const adminKey = process.env.ADMIN_PRIVATE_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, symbol } = req.body;
    if (!name || !symbol) return res.status(400).json({ error: 'Missing name or symbol' });

    // Sanitize inputs
    const nameSanitized = sanitizeInput(name);
    const symbolSanitized = sanitizeInput(symbol);

    // Generate fingerprint
    const fingerprint = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['string', 'string'], [nameSanitized, symbolSanitized])
    );

    const reason = `DAO Quarantine: suspicious fingerprint for ${name} (${symbol})`;

    // Setup provider and signer
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY as string, provider);

    // Connect to contract
    const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistryABI.abi, signer);

    // Execute on-chain quarantine
    const tx = await registry.daoQuarantine(fingerprint, reason);
    await tx.wait();

    return res.status(200).json({
      message: `✅ Quarantined ${name} (${symbol})`,
      fingerprint,
      txHash: tx.hash,
    });
  } catch (error: any) {
    const message = error?.reason || error?.message || 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
