// /pages/api/dao/request-upgrade.ts

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import axios from "axios";

// Fallback sanitize function
function sanitize(str: string): string {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    const body = req.body;
    const {
      type,
      name,
      symbol,
      tokenAddress = "",
      creator,
      proof1,
      proof2
    } = body;

    const requestedLevel =
      typeof body.requestedLevel === "number"
        ? body.requestedLevel
        : Number(body.requestedLevel);

    // Basic validation
    if (
      !name?.trim() ||
      !symbol?.trim() ||
      !creator?.trim() ||
      !proof1?.trim() ||
      !requestedLevel
    ) {
      console.error("❌ Missing required fields:", {
        name,
        symbol,
        creator,
        requestedLevel,
        proof1
      });
      return res.status(400).json({ error: "❌ Missing required fields" });
    }

    // ✅ Safe URL fallback (handles Vercel + local)
    const baseUrl = req.headers.origin || "http://localhost:3000";

    // 🧠 STEP 1: Call getTokenInfo to verify registry details
    const verifyRes = await axios.post(`${baseUrl}/api/dao/getTokenInfo`, {
      tokenAddress
    });

    const verified = verifyRes.data;

    // 🧪 STEP 2: Print fingerprint debug info
    console.log("🎯 Fingerprint Debug", {
      input: {
        name: sanitize(name),
        symbol: sanitize(symbol),
        creator: creator.toLowerCase(),
        tokenAddress: tokenAddress.toLowerCase()
      },
      verified: {
        name: sanitize(verified.name),
        symbol: sanitize(verified.symbol),
        creator: verified.creator.toLowerCase(),
        tokenAddress: verified.tokenAddress.toLowerCase()
      }
    });

    // 🔐 STEP 3: Block submission if fingerprint mismatch
    if (
      sanitize(name) !== sanitize(verified.name) ||
      sanitize(symbol) !== sanitize(verified.symbol) ||
      creator.toLowerCase() !== verified.creator.toLowerCase() ||
      tokenAddress.toLowerCase() !== verified.tokenAddress.toLowerCase()
    ) {
      return res.status(400).json({ error: "❌ Fingerprint mismatch. Submission rejected." });
    }

    // 📝 STEP 4: Proceed to save ticket
    const filePath = path.join(process.cwd(), "data", "dao-tickets.json");
    const fileRaw = fs.readFileSync(filePath, "utf-8");
    const allTickets = JSON.parse(fileRaw);

    const ticketNumber = allTickets.filter((t: any) => t.type === "E").length + 1;
    const submitted = new Date().toISOString();

    const newTicket = {
      ticket: `E#${ticketNumber}`,
      type: "E",
      name,
      symbol,
      tokenAddress,
      creator,
      proof1,
      proof2,
      requestedLevel,
      status: "pending",
      timestamp: Math.floor(Date.now() / 1000),
      submitted
    };

    allTickets.push(newTicket);
    fs.writeFileSync(filePath, JSON.stringify(allTickets, null, 2), "utf-8");

    return res.status(200).json({
      message: "✅ Upgrade request submitted",
      ticket: newTicket
    });

  } catch (err: any) {
    console.error("❌ Server error:", err.message || err);
    return res.status(500).json({ error: "❌ Internal Server Error" });
  }
}











