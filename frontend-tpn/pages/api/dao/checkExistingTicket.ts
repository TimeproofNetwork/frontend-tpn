// /pages/api/dao/checkExistingTicket.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using Service Role to allow read access
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { tokenAddress } = req.body;

    if (!tokenAddress) {
      return res.status(400).json({ error: "Missing tokenAddress" });
    }

    const { data, error } = await supabase
      .from("dao_tickets")
      .select("tokenAddress, type")
      .eq("tokenAddress", tokenAddress.toLowerCase())
      .eq("type", "E");

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      return res.status(500).json({ error: "Supabase query failed" });
    }

    const exists = data.length > 0;

    return res.status(200).json({ exists });
  } catch (err: any) {
    console.error("❌ checkExistingTicket failed:", err.message || err);
    return res.status(500).json({ error: "Server error" });
  }
}


