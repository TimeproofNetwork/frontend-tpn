import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fallback sanitize function
function sanitize(str: string): string {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
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

    // STEP 1: Check if token already has an E-type upgrade ticket
    const { data: existing, error: existErr } = await supabase
      .from("dao_tickets")
      .select("tokenAddress")
      .eq("tokenAddress", tokenAddress.toLowerCase())
      .eq("type", "E");

    if (existErr) {
      console.error("❌ Supabase check error:", existErr);
      return res.status(500).json({ error: "❌ Supabase check failed" });
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "❌ Upgrade request already submitted for this token." });
    }

    // STEP 2: Verify onchain token info
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : req.headers.origin || "http://localhost:3000";

    const verifyRes = await axios.post(`${baseUrl}/api/dao/getTokenInfo`, {
      tokenAddress
    });

    const verified = verifyRes.data;

    // STEP 3: Debug fingerprints
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

    // STEP 4: Fingerprint check
    if (
      sanitize(name) !== sanitize(verified.name) ||
      sanitize(symbol) !== sanitize(verified.symbol) ||
      creator.toLowerCase() !== verified.creator.toLowerCase() ||
      tokenAddress.toLowerCase() !== verified.tokenAddress.toLowerCase()
    ) {
      return res.status(400).json({ error: "❌ Fingerprint mismatch. Submission rejected." });
    }

    // STEP 5: Count total E-type tickets for new ticket number
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













