// pages/api/dao/get-public-suggestions.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type SuggestionStatus = "open" | "closed-approved" | "closed-rejected";

type Suggestion = {
  id?: string;                 // e.g. "S#3"
  ticket: string;              // "S1".."S5"
  token: string;
  reason: string;
  link1?: string;
  link2?: string;
  requester?: string;
  timestamp?: number;
  status?: SuggestionStatus;
};

// 🔗 Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("public_suggestions")
      .select("*");

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      return res.status(500).json({ error: "Failed to fetch from Supabase" });
    }

    const list: Suggestion[] = data ?? [];

    // Sort: open first, then by timestamp desc
    const sorted = [...list].sort((a, b) => {
      const aStatus = a.status ?? "open";
      const bStatus = b.status ?? "open";
      if (aStatus !== bStatus) {
        if (aStatus === "open") return -1;
        if (bStatus === "open") return 1;
      }
      const aTs = a.timestamp ?? 0;
      const bTs = b.timestamp ?? 0;
      return bTs - aTs;
    });

    return res.status(200).json({
      success: true,
      count: sorted.length,
      suggestions: sorted,
      updatedAt: Date.now()
    });

  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to read suggestions" });
  }
}

