import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from("tpn_token_meta")
    .select("address")
    .eq("symbol", "TPN")
    .single();

  if (error || !data) {
    return res.status(500).json({ error: "TPN token not found in Supabase" });
  }

  return res.status(200).json({ address: data.address });
}
