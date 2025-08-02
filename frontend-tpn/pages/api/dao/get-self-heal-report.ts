// pages/api/dao/get-self-heal-report.ts

import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

interface SelfHealReport {
  ok?: boolean;
  ranAt?: number;
  lines: string[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Only GET allowed now — POST removed to block live execution
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const filePath = path.join(process.cwd(), "data", "self-heal-report.json");

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(200).json({
        report: {
          lines: [],
          ranAt: undefined,
          ok: false,
          message: "No self-heal report found.",
        },
      });
    }

    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (!raw) {
      return res.status(200).json({
        report: {
          lines: [],
          ranAt: undefined,
          ok: false,
          message: "Self-heal report file is empty.",
        },
      });
    }

    const report: SelfHealReport = JSON.parse(raw);
    return res.status(200).json({ report });
  } catch (err: any) {
    console.error("❌ Failed to load self-heal report:", err);
    return res.status(500).json({
      report: {
        lines: [`❌ Error: ${err?.message || "Failed to parse self-heal report."}`],
        ranAt: undefined,
        ok: false,
      },
    });
  }
}




