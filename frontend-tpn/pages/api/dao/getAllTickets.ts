// pages/api/dao/getAllTickets.ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

type TicketType = "N" | "E" | "S";

// Canonical wire format for the UI (optionals allowed for S tickets)
interface Ticket {
  // Display ID like "E#12" | "N#3" | "S#7"
  ticket: string;

  // Category type for filter chips
  type: TicketType;               // "E" | "N" | "S"

  // EXTRA: Suggestion category code like "S5" (for S tickets only)
  ticketCode?: string;            // "S1".."S5"  (kept separate from display id)

  name?: string;
  symbol?: string;
  tokenAddress?: string;
  creator?: string;
  proof1?: string;
  proof2?: string;

  // Normalized for filters
  status: "pending" | "closed";

  // Timestamps
  submitted?: string;             // ISO from source
  timestamp?: number;             // epoch ms (strictly numeric, for sorting)

  // Description / reason (esp. for S)
  description?: string;
  reason?: string;

  // ✅ Requested level for E/N tickets
  requestedLevel?: number;
}

const dbPathTickets = path.join(process.cwd(), "data", "dao-tickets.json");
const dbPathSuggestions = path.join(process.cwd(), "data", "public-suggestions.json");

/* ------------------------------ helpers ------------------------------ */

function safeReadJSON(filePath: string): any[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (!raw) return [];
    const parsed: any = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.tickets)) return parsed.tickets;
    if (Array.isArray(parsed?.suggestions)) return parsed.suggestions;
    return [];
  } catch {
    return [];
  }
}

// Ensure "S2" -> "S#2", "E43" -> "E#43"; keep if already contains '#'
function normalizeTicketId(prefix: "E" | "N" | "S", rawId?: string | number): string {
  if (rawId === undefined || rawId === null) {
    return `${prefix}#${Date.now()}`; // last-resort
  }
  const s = String(rawId).trim();

  if (s.includes("#")) {
    const parts = s.split("#");
    const num = parts[1] ?? "";
    return `${prefix}#${num}`;
  }

  const m = s.match(/^[ENS](\d+)$/i); // "S2", "E43"
  if (m) return `${prefix}#${m[1]}`;

  if (/^\d+$/.test(s)) return `${prefix}#${s}`; // "7"

  return `${prefix}#${s}`;
}

function normalizeStatus(input: any): "pending" | "closed" {
  const raw = String(input ?? "").toLowerCase();
  if (raw.includes("pending") || raw === "open") return "pending";
  return "closed";
}

// ✅ Bulletproof: accepts seconds or milliseconds (number or numeric string)
function toEpoch(ts?: any, submitted?: any): number | undefined {
  // numeric
  if (typeof ts === "number" && Number.isFinite(ts) && ts > 0) {
    return ts < 1e12 ? ts * 1000 : ts; // < 1e12 => seconds, convert to ms
  }
  // numeric-like string
  if (typeof ts === "string" && /^\d+$/.test(ts)) {
    const n = Number(ts);
    return n < 1e12 ? n * 1000 : n;
  }
  // ISO fallback
  if (submitted) {
    const t = Date.parse(String(submitted));
    if (Number.isFinite(t)) return t;
  }
  return undefined;
}

/* ------------------------------ normalizers ------------------------------ */

// E/N tickets from dao-tickets.json
function normalizeEN(raw: any): Ticket | null {
  if (!raw) return null;

  // strictly E or N — never S here
  const rawType = String(raw.type ?? "").toUpperCase();
  const type: TicketType = rawType === "N" ? "N" : "E";

  const timestamp = toEpoch(raw.timestamp, raw.submitted);

  // ✅ bring through requestedLevel (fallback to "level" if ever used)
  const requestedLevel =
    typeof raw.requestedLevel === "number"
      ? raw.requestedLevel
      : typeof raw.level === "number"
      ? raw.level
      : undefined;

  return {
    ticket: normalizeTicketId(type, raw.ticket ?? raw.id ?? raw.number ?? timestamp),
    type, // "E" | "N"
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
    requestedLevel, // ✅ included in API payload
  };
}

// S tickets from public-suggestions.json
function normalizeS(raw: any): Ticket | null {
  if (!raw) return null;

  // Always "S" for suggestions (prevents leaking into E/N filters)
  const type: TicketType = "S";

  // Accept either numeric timestamp or ISO submitted and convert to epoch
  const timestamp = toEpoch(raw.timestamp, raw.submitted);

  // Suggestion category code like "S5" (keep as ticketCode)
  // In your sample: { "id": "S#7", "ticket": "S5", ... }
  const code = typeof raw.ticket === "string" ? raw.ticket.toUpperCase().trim() : undefined;

  // Display id: prefer "id" if present, else build "S#X"
  const displayId = normalizeTicketId("S", raw.id ?? raw.number ?? timestamp);

  return {
    ticket: displayId,              // => "S#7"
    type,                           // => "S"
    ticketCode: code,               // => "S5"
    tokenAddress: raw.token ?? raw.tokenAddress ?? raw.address ?? undefined,
    creator: raw.requester ?? raw.creator ?? undefined,
    proof1: raw.link1 ?? raw.proof1 ?? undefined,
    proof2: raw.link2 ?? raw.proof2 ?? undefined,
    status: normalizeStatus(raw.status),
    submitted: raw.submitted ?? undefined,
    timestamp,                      // strictly number (for sorting)
    description: raw.description ?? raw.message ?? undefined,
    reason: raw.reason ?? undefined,
    name: raw.name ?? undefined,
    symbol: raw.symbol ?? undefined,
  };
}

/* --------------------------------- API --------------------------------- */

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET requests allowed" });
  }

  try {
    // Read sources
    const rawEN = safeReadJSON(dbPathTickets);       // E/N
    const rawS  = safeReadJSON(dbPathSuggestions);   // S

    // Normalize
    const en: Ticket[] = rawEN.map(normalizeEN).filter(Boolean) as Ticket[];
    const s:  Ticket[] = rawS.map(normalizeS).filter(Boolean) as Ticket[];

    // Merge and sort NEWEST first (desc) by epoch timestamp
    const merged: Ticket[] = [...en, ...s].sort(
      (a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)
    );

    return res.status(200).json({ tickets: merged });
  } catch (err) {
    console.error("❌ Failed to load tickets:", err);
    return res.status(500).json({ error: "Failed to load tickets" });
  }
}







