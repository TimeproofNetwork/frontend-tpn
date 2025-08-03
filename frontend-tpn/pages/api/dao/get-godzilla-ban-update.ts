import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

interface GodzillaReport {
  success?: boolean;
  ranAt?: number;
  lines: string[];
  output?: string;
  txHashes?: string[];
  ok?: boolean; // legacy fallback
}

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Lock to GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("godzilla_ban_logs")
      .select("*")
      .order("ranAt", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      const empty: GodzillaReport = {
        success: false,
        ranAt: undefined,
        lines: [],
        output: "No Godzilla report found yet.",
        txHashes: [],
      };
      return res.status(200).json({ report: empty });
    }

    const report: GodzillaReport = {
      success: data.success ?? data.ok ?? false,
      ranAt: data.ranAt ?? undefined,
      lines: Array.isArray(data.lines) ? data.lines : [],
      output: data.output ?? undefined,
      txHashes: Array.isArray(data.txHashes) ? data.txHashes : [],
    };

    return res.status(200).json({ report });
  } catch (err: any) {
    console.error("❌ Supabase error reading Godzilla ban report:", err);
    const failure: GodzillaReport = {
      success: false,
      ranAt: undefined,
      lines: [`❌ Error: ${err?.message || "Failed to read godzilla-ban report."}`],
      output: "Read error.",
      txHashes: [],
    };
    return res.status(500).json({ report: failure });
  }
}








