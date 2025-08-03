// pages/api/dao/get-self-heal-report.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// ✅ Type declaration with 1:1 Supabase field names
interface SelfHealReport {
  ok?: boolean;
  ran_at?: string;
  duration?: string;
  gas_used?: string;
  tx_hash?: string;
  result_line?: string;
  lines: string[];
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
      .from("self_heal_logs")
      .select("*")
      .order("ran_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      const empty: SelfHealReport = {
        ok: false,
        ran_at: undefined,
        duration: undefined,
        gas_used: undefined,
        tx_hash: undefined,
        result_line: undefined,
        lines: [],
      };
      return res.status(200).json({ report: empty });
    }

    const report: SelfHealReport = {
      ok: data.ok ?? false,
      ran_at: data.ran_at ?? undefined,
      duration: data.duration ?? undefined,
      gas_used: data.gas_used ?? undefined,
      tx_hash: data.tx_hash ?? undefined,
      result_line: data.result_line ?? undefined,
      lines: Array.isArray(data.lines) ? data.lines : [],
    };

    return res.status(200).json({ report });
  } catch (err: any) {
    console.error("❌ Supabase error reading self-heal report:", err);
    const failure: SelfHealReport = {
      ok: false,
      ran_at: undefined,
      duration: undefined,
      gas_used: undefined,
      tx_hash: undefined,
      result_line: "Error reading self-heal report.",
      lines: [`❌ Error: ${err?.message || "Unknown failure."}`],
    };
    return res.status(500).json({ report: failure });
  }
}







