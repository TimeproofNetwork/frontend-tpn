import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// ✅ Type declaration
interface SelfHealReport {
  ok?: boolean;
  ranAt?: number;
  lines: string[];
  message?: string;
}

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("self_heal_logs")
      .select("*")
      .order("ranAt", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(200).json({
        report: {
          lines: [],
          ranAt: undefined,
          ok: false,
          message: "No self-heal report found.",
        } as SelfHealReport,
      });
    }

    const report: SelfHealReport = {
      ok: data.ok ?? false,
      ranAt: data.ranAt ?? undefined,
      lines: data.lines ?? [],
      message: data.message ?? undefined,
    };

    return res.status(200).json({ report });
  } catch (err: any) {
    console.error("❌ Failed to fetch self-heal report from Supabase:", err);
    return res.status(500).json({
      report: {
        lines: [`❌ Error: ${err?.message || "Failed to load self-heal report."}`],
        ranAt: undefined,
        ok: false,
      } as SelfHealReport,
    });
  }
}





