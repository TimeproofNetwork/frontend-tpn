// pages/api/dao/handle-existing-upgrade-decision.ts

import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Canonical type (shared with get-pending-upgrade-requests)
interface UpgradeRequest {
  ticket: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  creator: string;
  proof1: string;
  proof2?: string;
  requestedLevel: number;
  currentLevel?: number;
  submitted: string;
  status: "pending" | "Closed - Approved" | "Closed - Rejected";
  decisionTimestamp?: string;
  daoNotes?: string;
}

const DB_PATH = path.join(process.cwd(), "data", "dao-upgrade-requests.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticket, decision, daoNotes } = req.body;

  if (!ticket || !decision || !["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const requests: UpgradeRequest[] = JSON.parse(raw);

    const index = requests.findIndex((r) => r.ticket === ticket);
    if (index === -1) {
      return res.status(404).json({ error: "Request not found" });
    }

    const timestamp = new Date().toISOString();
    requests[index].status =
      decision === "approved" ? "Closed - Approved" : "Closed - Rejected";
    requests[index].decisionTimestamp = timestamp;
    if (daoNotes) {
      requests[index].daoNotes = daoNotes;
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(requests, null, 2));

    return res.status(200).json({
      message: `Request ${ticket} ${decision}`,
      request: requests[index],
    });
  } catch (err) {
    console.error("❌ Failed to process upgrade decision:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}






