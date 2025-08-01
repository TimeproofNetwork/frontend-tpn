// /pages/api/dao/checkExistingTicket.ts

import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "dao-tickets.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { name, symbol, tokenAddress } = req.body;

    if (!tokenAddress) {
      return res.status(400).json({ error: "Missing tokenAddress" });
    }

    const raw = fs.readFileSync(dbPath, "utf-8");
    const tickets = JSON.parse(raw);

    const exists = tickets.some(
      (ticket: any) =>
        ticket.tokenAddress?.toLowerCase?.() === tokenAddress.toLowerCase() &&
        ticket.type === "E"
    );

    return res.status(200).json({ exists });
  } catch (err: any) {
    console.error("❌ checkExistingTicket failed:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

