import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import registryABI from '@/abi/TokenRegistry.json';
import sanitizeInput from '@/utils/sanitizeInputs';

// ✅ Final deployed TokenRegistry address (from .env)
const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;

// ✅ Alchemy Sepolia RPC (from .env for backend use)
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL as string;

// ✅ DAO signer private key (backend-only usage)
const DAO_PRIVATE_KEY = process.env.DAO_PRIVATE_KEY as string;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { name, symbol } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({ error: 'Missing name or symbol' });
    }

    const nameSanitized = sanitizeInput(name);
    const symbolSanitized = sanitizeInput(symbol);

    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(DAO_PRIVATE_KEY, provider);
    const registry = new ethers.Contract(REGISTRY_ADDRESS, registryABI.abi, wallet);

    console.log(`🔓 Attempting Unquarantine: ${nameSanitized} (${symbolSanitized})`);

    const tx = await registry.unquarantineToken(nameSanitized, symbolSanitized);
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      txHash: receipt.transactionHash,
      message: `✅ Unquarantined ${nameSanitized} (${symbolSanitized})`,
    });
  } catch (error: any) {
    const reason =
      error?.reason || error?.error?.message || error?.message || 'Unquarantine failed';
    console.error('❌ Unquarantine error:', reason);
    return res.status(500).json({ error: reason });
  }
}
