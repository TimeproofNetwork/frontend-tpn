import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export interface UpgradeRequest {
  ticket: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  creator: string;
  currentLevel: number;
  requestedLevel: number;
  proof1: string;
  proof2?: string;
  submitted: string;
  status: "Pending" | "Closed - Approved" | "Closed - Rejected";
  decisionTimestamp?: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), "data", "dao-tickets.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const allTickets: UpgradeRequest[] = JSON.parse(raw);

  console.log("📦 Total tickets:", allTickets.length);

  const pending = allTickets.filter((r) => r.status === "Pending");

  pending.forEach((ticket) => {
    if (!ticket.submitted) {
      console.warn(`⚠️ Missing submitted: ${ticket.ticket}`);
    } else {
      console.log(`✅ Ticket ${ticket.ticket} submitted: ${ticket.submitted}`);
    }
  });

  return res.status(200).json({ pending });
}







