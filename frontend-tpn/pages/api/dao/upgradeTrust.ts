// pages/api/dao/upgradeTrust.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import TokenRegistry from '@/abi/TokenRegistry.json';
import sanitizeInput from '@/utils/sanitizeInputs';

const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL as string;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}`;

const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
const Registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistry.abi, wallet);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, symbol, tokenAddress, newLevel, proof1, proof2 } = req.body;

  if (!name || !symbol || !tokenAddress || !newLevel || !proof1) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const nameSanitized = sanitizeInput(name);
    const symbolSanitized = sanitizeInput(symbol);
    const checksumAddress = ethers.utils.getAddress(tokenAddress.toLowerCase());

    const tx = await Registry.daoUpgradeTrustLevel(
      checksumAddress,
      newLevel,
      proof1,
      proof2 || ''
    );

    await tx.wait();

    return res.status(200).json({ success: true, message: `Upgrade successful to Level ${newLevel}` });
  } catch (err: any) {
    const reason = err?.reason || err?.error?.message || err.message || 'Unknown error';
    return res.status(500).json({ success: false, error: reason });
  }
}
