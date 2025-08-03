// /pages/api/dao/update-ticket-status.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, status } = req.body;

  if (!id || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Missing or invalid id/status" });
  }

  const newStatus = status === "approved" ? "Closed - Approved" : "Closed - Rejected";
  const decisionTimestamp = new Date().toISOString();

  try {
    // 🛠️ Update the ticket by ID
    const { data, error } = await supabase
      .from("dao_tickets")
      .update({
        status: newStatus,
        decisionTimestamp
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase update error:", error);
      return res.status(500).json({ error: "Failed to update ticket" });
    }

    console.log(`📝 Ticket ${id} marked as ${newStatus}`);
    return res.status(200).json({ success: true, updatedTicket: data });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


