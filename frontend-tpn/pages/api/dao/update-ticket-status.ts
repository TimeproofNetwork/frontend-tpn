import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const TICKETS_PATH = path.join(process.cwd(), "data", "dao-tickets.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, status } = req.body;

  if (!id || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Missing or invalid id/status" });
  }

  try {
    const raw = fs.readFileSync(TICKETS_PATH, "utf-8");
    const tickets = JSON.parse(raw);

    const index = tickets.findIndex((t: any) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // 🕒 Update status and decisionTimestamp
    tickets[index].status =
      status === "approved" ? "Closed - Approved" : "Closed - Rejected";
    tickets[index].decisionTimestamp = new Date().toISOString();

    fs.writeFileSync(TICKETS_PATH, JSON.stringify(tickets, null, 2));
    console.log(`📝 Ticket ${id} marked as ${tickets[index].status}`);

    return res.status(200).json({ success: true, updatedTicket: tickets[index] });
  } catch (err: any) {
    console.error("❌ Failed to update ticket:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

