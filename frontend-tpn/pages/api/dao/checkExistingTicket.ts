// /pages/api/dao/checkExistingTicket.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Canonical sanitize function (CIS-compliant)
function sanitize(str: string): string {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

// 🧬 Fingerprint generator
function generateFingerprint(
  name: string,
  symbol: string,
  tokenAddress: string,
  creator: string
): string {
  return `${sanitize(name)}|${sanitize(symbol)}|${tokenAddress.toLowerCase()}|${creator.toLowerCase()}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { tokenAddress, name, symbol, creator, type = "E" } = req.body;

    if (!tokenAddress || !name || !symbol || !creator) {
      return res.status(400).json({ error: "Missing tokenAddress, name, symbol, or creator" });
    }

    // 🧬 Generate fingerprint
    const fingerprint = generateFingerprint(name, symbol, tokenAddress, creator);

    // 🔍 Supabase query only for matching fingerprint (case-sensitive column fix)
    const { data, error } = await supabase
      .from("dao_tickets")
      .select("id")
      .eq("uniquefingerprint", fingerprint) // ✅ lowercase column name
      .eq("type", type)
      .eq("status", "pending");

    if (error) {
      console.error("❌ Supabase query failed:", error.message);
      return res.status(500).json({ error: "Supabase query failed" });
    }

    const exists = Array.isArray(data) && data.length > 0;

    return res.status(200).json({ exists });

  } catch (err: any) {
    console.error("❌ checkExistingTicket failed:", err.message || err);
    return res.status(500).json({ error: "Server error" });
  }
}










