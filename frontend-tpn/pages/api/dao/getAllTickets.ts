// pages/api/dao/getAllTickets.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type TicketType = "N" | "E" | "S";

type Ticket = {
  ticket: string;
  type: TicketType;
  ticketCode?: string;
  name?: string;
  symbol?: string;
  tokenAddress?: string;
  creator?: string;
  proof1?: string;
  proof2?: string;
  status: "pending" | "closed";
  submitted?: string;
  timestamp?: number;
  description?: string;
  reason?: string;
  requestedLevel?: number;
};

function normalizeTicketId(prefix: "E" | "N" | "S", rawId?: string | number): string {
  if (!rawId) return `${prefix}#${Date.now()}`;
  const s = String(rawId).trim();
  if (s.includes("#")) return s;
  const m = s.match(/^[ENS](\d+)$/i);
  if (m) return `${prefix}#${m[1]}`;
  if (/^\d+$/.test(s)) return `${prefix}#${s}`;
  return `${prefix}#${s}`;
}

function normalizeStatus(input: any): "pending" | "closed" {
  const raw = String(input ?? "").toLowerCase();
  if (raw.includes("pending") || raw === "open") return "pending";
  return "closed";
}

function toEpoch(ts?: any, submitted?: any): number | undefined {
  if (typeof ts === "number" && Number.isFinite(ts) && ts > 0) return ts < 1e12 ? ts * 1000 : ts;
  if (typeof ts === "string" && /^\d+$/.test(ts)) {
    const n = Number(ts);
    return n < 1e12 ? n * 1000 : n;
  }
  if (submitted) {
    const t = Date.parse(String(submitted));
    if (Number.isFinite(t)) return t;
  }
  return undefined;
}

function normalizeEN(raw: any): Ticket | null {
  if (!raw) return null;
  const type: TicketType = String(raw.type ?? "").toUpperCase() === "N" ? "N" : "E";
  const timestamp = toEpoch(raw.timestamp, raw.submitted);
  const requestedLevel =
    typeof raw.requestedLevel === "number"
      ? raw.requestedLevel
      : typeof raw.level === "number"
      ? raw.level
      : undefined;
  return {
    ticket: normalizeTicketId(type, raw.ticket ?? raw.id ?? raw.number ?? timestamp),
    type,
    name: raw.name ?? undefined,
    symbol: raw.symbol ?? undefined,
    tokenAddress: raw.tokenAddress ?? raw.address ?? undefined,
    creator: raw.creator ?? undefined,
    proof1: raw.proof1 ?? undefined,
    proof2: raw.proof2 ?? undefined,
    status: normalizeStatus(raw.status),
    submitted: raw.submitted ?? undefined,
    timestamp,
    description: raw.description ?? undefined,
    reason: raw.reason ?? undefined,
    requestedLevel,
  };
}

function normalizeS(raw: any): Ticket | null {
  if (!raw) return null;
  const type: TicketType = "S";
  const timestamp = toEpoch(raw.timestamp, raw.submitted);
  const code = typeof raw.ticket === "string" ? raw.ticket.toUpperCase().trim() : undefined;
  const displayId = normalizeTicketId("S", raw.id ?? raw.number ?? timestamp);
  return {
    ticket: displayId,
    type,
    ticketCode: code,
    tokenAddress: raw.token ?? raw.tokenAddress ?? raw.address ?? undefined,
    creator: raw.requester ?? raw.creator ?? undefined,
    proof1: raw.link1 ?? raw.proof1 ?? undefined,
    proof2: raw.link2 ?? raw.proof2 ?? undefined,
    status: normalizeStatus(raw.status),
    submitted: raw.submitted ?? undefined,
    timestamp,
    description: raw.description ?? raw.message ?? undefined,
    reason: raw.reason ?? undefined,
    name: raw.name ?? undefined,
    symbol: raw.symbol ?? undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET requests allowed" });
  }

  try {
    const [enRes, sRes] = await Promise.all([
      supabase.from("dao_tickets").select("*"),
      supabase.from("public_suggestions").select("*")
    ]);

    if (enRes.error || sRes.error) {
      console.error("❌ Supabase fetch error:", enRes.error || sRes.error);
      return res.status(500).json({ error: "Failed to load tickets" });
    }

    const en: Ticket[] = (enRes.data || []).map(normalizeEN).filter(Boolean) as Ticket[];
    const s: Ticket[] = (sRes.data || []).map(normalizeS).filter(Boolean) as Ticket[];

    const merged: Ticket[] = [...en, ...s].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

    return res.status(200).json({ tickets: merged });
  } catch (err) {
    console.error("❌ Unexpected failure:", err);
    return res.status(500).json({ error: "Unexpected failure loading tickets" });
  }
}








