// pages/api/dao/get-godzilla-ban-update.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

interface GodzillaReport {
  success?: boolean;
  ran_at?: string;              // ✅ Use exact Supabase column name
  lines: string[];
  output?: string;
  tx_hashes?: string[];         // ✅ Snake_case for 1:1 DB match
}

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("godzilla_ban_logs")
      .select("*")
      .order("ran_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      const empty: GodzillaReport = {
        success: false,
        ran_at: undefined,
        lines: [],
        output: "No Godzilla report found yet.",
        tx_hashes: [],
      };
      return res.status(200).json({ report: empty });
    }

    const report: GodzillaReport = {
      success: data.success ?? data.ok ?? false,
      ran_at: data.ran_at ?? undefined,
      lines: Array.isArray(data.lines) ? data.lines : [],
      output: data.output ?? undefined,
      tx_hashes: Array.isArray(data.tx_hashes) ? data.tx_hashes : [],
    };

    return res.status(200).json({ report });
  } catch (err: any) {
    console.error("❌ Supabase error reading Godzilla ban report:", err);
    const failure: GodzillaReport = {
      success: false,
      ran_at: undefined,
      lines: [`❌ Error: ${err?.message || "Failed to read godzilla-ban report."}`],
      output: "Read error.",
      tx_hashes: [],
    };
    return res.status(500).json({ report: failure });
  }
}










