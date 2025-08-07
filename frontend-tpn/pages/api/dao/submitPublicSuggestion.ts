// /pages/api/dao/submitPublicSuggestion.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
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

// 🧬 Fingerprint generator: requester + token only
function generateFingerprint(token: string, requester: string): string {
  return `${token.toLowerCase()}|${requester.toLowerCase()}`;
}

type Suggestion = {
  id?: string;
  ticket: string;
  token: string;
  reason: string;
  link1: string;
  link2?: string;
  requester: string;
  timestamp: number;
  status: "open" | "closed-approved" | "closed-rejected";
  uniquefingerprint?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticket, token, reason, link1, link2, requester } = req.body || {};

  // Basic validation
  if (!ticket || !token || !reason || !link1 || !requester) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Address format check
  const isTokenAddr = typeof token === "string" && ethers.utils.isAddress(token);
  const isRequesterAddr = typeof requester === "string" && ethers.utils.isAddress(requester);

  if (!isTokenAddr || !isRequesterAddr) {
    return res.status(400).json({ error: "Invalid token or requester address." });
  }

  const normalizedToken = ethers.utils.getAddress(token);
  const normalizedRequester = ethers.utils.getAddress(requester);
  const uniquefingerprint = generateFingerprint(normalizedToken, normalizedRequester);

  // Check if this suggestion already exists by fingerprint
  const { data: existing, error: queryErr } = await supabase
    .from("public_suggestions")
    .select("id")
    .eq("uniquefingerprint", uniquefingerprint)
    .eq("status", "open");

  if (queryErr) {
    console.error("❌ Supabase read error:", queryErr);
    return res.status(500).json({ error: "Internal error while checking duplicates." });
  }

  if (existing && existing.length > 0) {
    return res
      .status(409)
      .json({ error: "Suggestion already exists for this token and requester (open)." });
  }

  // Compute next ticket id
  const { count } = await supabase
    .from("public_suggestions")
    .select("*", { count: "exact", head: true });

  const nextNumber = (count ?? 0) + 1;
  const ticketId = `S#${nextNumber}`;

  const newEntry: Suggestion = {
    id: ticketId,
    ticket: String(ticket),
    token: normalizedToken,
    reason: String(reason),
    link1: String(link1),
    link2: link2 ? String(link2) : undefined,
    requester: normalizedRequester,
    timestamp: Date.now(),
    status: "open",
    uniquefingerprint // ✅ Now matches new logic
  };

  const { error: insertErr } = await supabase
    .from("public_suggestions")
    .insert([newEntry]);

  if (insertErr) {
    console.error("❌ Supabase insert error:", insertErr);
    return res.status(500).json({ error: "Failed to save suggestion." });
  }

  return res.status(200).json({ success: true, suggestion: newEntry, ticketId });
}








