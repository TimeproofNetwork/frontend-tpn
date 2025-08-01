// pages/api/dao/godzilla-ban-update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

interface GodzillaReport {
  // keep legacy optional keys for safety
  ok?: boolean;
  success?: boolean;
  ranAt?: number;            // canonical timestamp key used by the UI
  lines: string[];
  output?: string;           // summary text from writer
  txHashes?: string[];       // array of tx hashes from writer
}

function getReportPath(): string {
  // If this API route is inside the frontend app, cwd() == frontend-tpn root.
  // So the data file is at ./data/godzilla-ban.json
  return path.join(process.cwd(), "data", "godzilla-ban.json");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Allow GET and POST (UI often uses GET)
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const filePath = getReportPath();

  try {
    if (!fs.existsSync(filePath)) {
      const empty: GodzillaReport = {
        success: false,
        ranAt: undefined,
        lines: [],
        output: "No Godzilla report found.",
        txHashes: [],
      };
      return res.status(200).json({ report: empty });
    }

    const raw = fs.readFileSync(filePath, "utf-8").trim();

    if (!raw) {
      const empty: GodzillaReport = {
        success: false,
        ranAt: undefined,
        lines: [],
        output: "Godzilla report file is empty.",
        txHashes: [],
      };
      return res.status(200).json({ report: empty });
    }

    const data = JSON.parse(raw) as GodzillaReport;

    // ✅ Normalize to canonical keys the UI expects
    const normalized: GodzillaReport = {
      success: data.success ?? data.ok ?? false,
      ranAt: data.ranAt,
      lines: Array.isArray(data.lines) ? data.lines : [],
      output: data.output,
      txHashes: Array.isArray((data as any).txHashes) ? (data as any).txHashes : [],
    };

    return res.status(200).json({ report: normalized });
  } catch (err: any) {
    console.error("❌ Error reading Godzilla ban report:", err);
    const failure: GodzillaReport = {
      success: false,
      ranAt: undefined,
      lines: [`❌ Error: ${err?.message || "Failed to read godzilla-ban report."}`],
      output: "Read error.",
      txHashes: [],
    };
    return res.status(500).json({ report: failure });
  }
}











