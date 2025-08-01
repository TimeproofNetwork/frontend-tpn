// pages/api/dao/submitPublicSuggestion.ts

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { ethers } from "ethers";

type Suggestion = {
  id?: string;          // human-readable ticket id, e.g., "S#3"
  ticket: string;       // S1..S5 category
  token: string;        // token or creator address
  reason: string;
  link1: string;
  link2?: string;
  requester: string;    // connected wallet
  timestamp: number;
  status: "open" | "closed-approved" | "closed-rejected";
};

// File location: /data/public-suggestions.json
const DB_PATH = path.join(process.cwd(), "data", "public-suggestions.json");

function readDB(): Suggestion[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

function writeDB(data: Suggestion[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticket, token, reason, link1, link2, requester } = req.body || {};

  // Basic validation (frontend enforces too)
  if (!ticket || !token || !reason || !link1 || !requester) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Validate addresses
  const isTokenAddr = typeof token === "string" && ethers.utils.isAddress(token);
  const isRequesterAddr = typeof requester === "string" && ethers.utils.isAddress(requester);

  if (!isTokenAddr || !isRequesterAddr) {
    return res.status(400).json({ error: "Invalid token or requester address." });
  }

  // Persist + duplicate protection (by token address, any open suggestion)
  const suggestions = readDB();

  const exists = suggestions.some(
    (s) => s.token.toLowerCase() === token.toLowerCase() && s.status === "open"
  );
  if (exists) {
    return res
      .status(409)
      .json({ error: "Suggestion already exists for this token (open)." });
  }

  // ✅ Compute next ticket id BEFORE pushing
  const nextNumber = suggestions.length + 1;
  const ticketId = `S#${nextNumber}`;

  const newEntry: Suggestion = {
    id: ticketId,                                 // store human-readable id too
    ticket: String(ticket),
    token: ethers.utils.getAddress(token),        // checksum
    reason: String(reason),
    link1: String(link1),
    link2: link2 ? String(link2) : undefined,
    requester: ethers.utils.getAddress(requester),
    timestamp: Date.now(),
    status: "open",
  };

  suggestions.push(newEntry);
  writeDB(suggestions);

  // ✅ Return the S-number so UI can show "✅ Suggestion submitted: S#<n>"
  return res.status(200).json({ success: true, suggestion: newEntry, ticketId });
}





