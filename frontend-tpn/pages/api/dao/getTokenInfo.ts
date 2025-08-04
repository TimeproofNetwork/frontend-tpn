import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";
import TokenRegistry from "@/abi/TokenRegistry.json";

// ✅ Canonical CIS Sanitization
function sanitize(str: string): string {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

// ✅ Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Onchain fallback setup
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const TOKEN_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;
const registry = new ethers.Contract(TOKEN_REGISTRY_ADDRESS, TokenRegistry.abi, provider);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Only POST method allowed." });
  }

  try {
    const { tokenAddress, name, symbol } = req.body;

    if (!tokenAddress && (!name || !symbol)) {
      return res.status(400).json({ error: "❌ tokenAddress or name+symbol required." });
    }

    // 🔍 1. Supabase lookup by tokenAddress
    if (tokenAddress) {
      const { data, error } = await supabase
        .from("dao_tickets")
        .select("*")
        .eq("tokenAddress", tokenAddress.toLowerCase())
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("❌ Supabase tokenAddress error:", error.message);
      }

      if (data) {
        return res.status(200).json({
          name: data.name,
          symbol: data.symbol,
          creator: data.creator,
          timestamp: data.timestamp,
          trustLevel: data.requestedLevel ?? 0,
          tokenAddress: data.tokenAddress,
          fingerprint: {
            name: sanitize(data.name),
            symbol: sanitize(data.symbol),
          },
        });
      }
    }

    // 🔁 2. Supabase fallback by sanitized name + symbol
  if (name && symbol) {
  const inputName = sanitize(name);
  const inputSymbol = sanitize(symbol);

  const { data, error } = await supabase
    .from("dao_tickets")
    .select("*")
    .eq("type", "N")            // ✅ Only new token registrations
    .eq("status", "closed")     // ✅ Only finalized entries
    .order("timestamp", { ascending: false })
    .limit(500);

  if (error) {
    console.error("❌ Supabase name+symbol fallback error:", error.message);
  }

  const match = data?.find(
    (token) =>
      sanitize(token.name) === inputName &&
      sanitize(token.symbol) === inputSymbol
  );

  if (match) {
    return res.status(200).json({
      name: match.name,
      symbol: match.symbol,
      creator: match.creator,
      timestamp: match.timestamp,
      trustLevel: match.requestedLevel ?? 0,
      tokenAddress: match.tokenAddress,
      fingerprint: {
        name: sanitize(match.name),
        symbol: sanitize(match.symbol),
      },
    });
  }
}

    // 🧱 3. Onchain contract lookup
    if (tokenAddress) {
      try {
        const result = await registry.getTokenInfo(tokenAddress);

        return res.status(200).json({
          name: result[0],
          symbol: result[1],
          creator: result[3],
          timestamp: result[4]?.toNumber?.() ?? 0,
          trustLevel: result[7] ?? 0,
          tokenAddress,
          fingerprint: {
            name: sanitize(result[0]),
            symbol: sanitize(result[1]),
          },
        });
      } catch (err: any) {
        console.error("❌ Onchain getTokenInfo() failed:", err.message);
      }
    }

    // ✅ Final fallback: allow UI to proceed (token not found anywhere)
    return res.status(200).json(null);

  } catch (err: any) {
    console.error("❌ Server error:", err.message || err);
    return res.status(500).json({ error: "❌ Internal server error." });
  }
}
















