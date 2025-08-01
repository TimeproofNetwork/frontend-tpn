// pages/api/dao/get-godzilla-ban-update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

interface GodzillaReport {
  // canonical fields written by the writer
  success?: boolean;
  ranAt?: number;
  lines: string[];
  output?: string;
  txHashes?: string[];
  // legacy for backward-compat
  ok?: boolean;
}

function getReportPath(): string {
  // If this API route is inside the frontend app, cwd() is the app root.
  // The file lives at ./data/godzilla-ban.json
  return path.join(process.cwd(), "data", "godzilla-ban.json");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Lock to GET only
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const filePath = getReportPath();

  try {
    if (!fs.existsSync(filePath)) {
      const empty: GodzillaReport = {
        success: false,
        ranAt: undefined,
        lines: [],
        output: "No Godzilla report found yet.",
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

    // ✅ Normalize to canonical keys for the UI
    const normalized: GodzillaReport = {
      success: data.success ?? data.ok ?? false,
      ranAt: data.ranAt,
      lines: Array.isArray(data.lines) ? data.lines : [],
      output: data.output,
      txHashes: Array.isArray(data.txHashes) ? data.txHashes : [],
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






