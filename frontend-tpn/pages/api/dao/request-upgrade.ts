// /pages/api/dao/request-upgrade.ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔐 CIS Sanitization
function sanitize(str: string): string {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

// 🧬 Fingerprint Generator
function generateFingerprint(
  name: string,
  symbol: string,
  tokenAddress: string,
  creator: string
): string {
  return `${sanitize(name)}|${sanitize(symbol)}|${tokenAddress.toLowerCase()}|${creator.toLowerCase()}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    const {
      type,
      name,
      symbol,
      tokenAddress = "",
      creator,
      proof1,
      proof2
    } = req.body;

    const requestedLevel =
      typeof req.body.requestedLevel === "number"
        ? req.body.requestedLevel
        : Number(req.body.requestedLevel);

    // ✅ Mandatory field check
    if (
      !name?.trim() ||
      !symbol?.trim() ||
      !creator?.trim() ||
      !proof1?.trim() ||
      !requestedLevel
    ) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }

    const baseUrl =
      req.headers.origin ||
      (req.headers.host?.startsWith("localhost")
        ? "http://localhost:3000"
        : `https://${req.headers.host}`);

    // ✅ STEP 1: Fetch on-chain fingerprint for validation
    let verified = null;
    try {
      const verifyRes = await axios.post(`${baseUrl}/api/dao/getTokenInfo`, {
        tokenAddress
      });
      verified = verifyRes.data;
    } catch (err: any) {
      console.warn("⚠️ getTokenInfo failed, skipping fingerprint check.");
    }

    if (verified) {
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

      if (
        sanitize(name) !== sanitize(verified.name) ||
        sanitize(symbol) !== sanitize(verified.symbol) ||
        creator.toLowerCase() !== verified.creator.toLowerCase() ||
        tokenAddress.toLowerCase() !== verified.tokenAddress.toLowerCase()
      ) {
        return res.status(400).json({ error: "❌ Fingerprint mismatch. Submission rejected." });
      }
    } else {
      return res.status(400).json({ error: "❌ Token not found on-chain. Please register first." });
    }

    // 🧬 STEP 2: Generate unique fingerprint
    const uniqueFingerprint = generateFingerprint(name, symbol, tokenAddress, creator);

    // 🛑 STEP 3: Check if this fingerprint already exists
    const { data: existing, error: existErr } = await supabase
      .from("dao_tickets")
      .select("uniquefingerprint") // ✅ updated column name
      .eq("uniquefingerprint", uniqueFingerprint) // ✅ updated column name
      .eq("type", "E")
      .eq("status", "pending");

    if (existErr) {
      console.error("❌ Supabase fingerprint check error:", existErr);
      return res.status(500).json({ error: "Error checking existing tickets." });
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "❌ Duplicate upgrade already submitted." });
    }

    // ✅ STEP 4: Get E-count for ticket number
    const { count, error: countErr } = await supabase
      .from("dao_tickets")
      .select("*", { count: "exact", head: true })
      .eq("type", "E");

    if (countErr) {
      console.error("❌ Supabase count error:", countErr);
      return res.status(500).json({ error: "Error while counting tickets." });
    }

    const ticketNumber = (count ?? 0) + 1;
    const submitted = new Date().toISOString();

    // ✅ STEP 5: Save new ticket with fingerprint
    const newTicket = {
      ticket: `E#${ticketNumber}`,
      type: "E",
      name,
      symbol,
      tokenAddress: tokenAddress.toLowerCase(),
      creator: creator.toLowerCase(),
      proof1,
      proof2,
      requestedLevel,
      status: "pending",
      timestamp: Math.floor(Date.now() / 1000),
      submitted,
      uniquefingerprint: uniqueFingerprint // ✅ lowercase key
    };

    const { error: insertErr } = await supabase
      .from("dao_tickets")
      .insert([newTicket]);

    if (insertErr) {
      console.error("❌ Supabase insert error:", insertErr);
      return res.status(500).json({ error: "Failed to save ticket." });
    }

    return res.status(200).json({
      message: "✅ Upgrade request submitted",
      ticket: newTicket
    });

  } catch (err: any) {
    console.error("❌ Server error:", err.message || err);
    return res.status(500).json({ error: "❌ Internal Server Error" });
  }
}


















