// pages/api/dao/get-public-suggestions.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type SuggestionStatus = "open" | "closed-approved" | "closed-rejected";

type Suggestion = {
  id?: string;                 // e.g. "S#3"
  ticket: string;              // "S1".."S5"
  token: string;
  reason: string;
  link1?: string;
  link2?: string;
  requester?: string;
  timestamp?: number;
  status?: SuggestionStatus;
};

const DB_PATH = path.join(process.cwd(), "data", "public-suggestions.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(200).json({ success: true, suggestions: [], count: 0 });
    }

    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const list: Suggestion[] = JSON.parse(raw || "[]");

    // Sort: open first, then by timestamp desc
    const sorted = [...list].sort((a, b) => {
      const aStatus = a.status ?? "open";
      const bStatus = b.status ?? "open";
      if (aStatus !== bStatus) {
        if (aStatus === "open") return -1;
        if (bStatus === "open") return 1;
      }
      const aTs = a.timestamp ?? 0;
      const bTs = b.timestamp ?? 0;
      return bTs - aTs;
    });

    return res.status(200).json({
      success: true,
      count: sorted.length,
      suggestions: sorted,
      updatedAt: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to read suggestions" });
  }
}
