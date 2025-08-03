"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type SuggestionStatus = "open" | "closed-approved" | "closed-rejected";

interface Suggestion {
  id?: string;                 // e.g., "S#9"
  ticket: string;             // e.g., "S4"
  token: string;
  reason: string;
  link1?: string;
  link2?: string;
  requester?: string;
  timestamp?: number;
  status?: SuggestionStatus;
}

const TICKET_LABELS: Record<string, string> = {
  S1: "Upgrade Existing Token Badge",
  S2: "Quarantine or Ban Token/Creator",
  S3: "Request Self-Heal",
  S4: "Godzilla Layer Exception",
  S5: "Report Suspicious Token/Creator",
};

function fmtAddr(addr?: string) {
  if (!addr || addr.length < 10) return addr || "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function compressLabel(label?: string) {
  if (!label) return "";
  const parts = label.split(" ").filter(Boolean);
  if (parts.length < 2) return label;
  return `${parts[0]}…${parts[parts.length - 1]}`;
}

function StatusBadge({ status }: { status?: SuggestionStatus }) {
  if (status === "closed-approved") {
    return (
      <span className="ml-2 inline-flex items-center rounded bg-green-900/40 px-2 py-0.5 text-xs font-semibold text-green-300 border border-green-700/40">
        Approved (Closed)
      </span>
    );
  }
  if (status === "closed-rejected") {
    return (
      <span className="ml-2 inline-flex items-center rounded bg-red-900/40 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-700/40">
        Rejected (Closed)
      </span>
    );
  }
  return (
    <span className="ml-2 inline-flex items-center rounded bg-yellow-900/40 px-2 py-0.5 text-xs font-semibold text-yellow-300 border border-yellow-700/40">
      Pending
    </span>
  );
}

export default function DAOInboxSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/dao/get-public-suggestions");
      const raw = res.data?.suggestions || [];

      const sorted = raw.sort(
        (a: Suggestion, b: Suggestion) => (b.timestamp ?? 0) - (a.timestamp ?? 0)
      );

      setSuggestions(sorted);
    } catch (err) {
      console.error("❌ Failed to fetch suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-700 h-full w-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <img
          src="/emblem.png"
          alt="TPN"
          className="w-[1.15em] h-[1.15em] mr-2 align-middle"
        />
        S# Suggestions Inbox ({suggestions.length})
      </h3>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : suggestions.length === 0 ? (
        <p className="text-gray-400 text-sm">No suggestions received yet.</p>
      ) : (
        <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
          {suggestions.map((sug) => {
            const idDisplay = sug.id || "S#?";
            const ticketCode = sug.ticket;
            const fullLabel = TICKET_LABELS[ticketCode];
            const compressed = compressLabel(fullLabel);
            const submitted = sug.timestamp
              ? new Date(sug.timestamp).toLocaleString()
              : "—";

            return (
              <div
                key={`${idDisplay}-${sug.token}`}
                className="bg-black border border-gray-700 rounded p-4 text-sm text-white"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold flex items-center gap-2">
                    <span className="font-mono text-purple-400">{idDisplay}</span>
                    <span className="text-gray-400">
                      {ticketCode ? `— ${ticketCode}: ${compressed}` : ""}
                    </span>
                    <StatusBadge status={sug.status} />
                  </p>
                </div>

                <p className="text-gray-300">
                  <span className="font-semibold">Requester:</span>{" "}
                  {fmtAddr(sug.requester)}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Address:</span> {sug.token}
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  <span className="font-semibold text-gray-400">Submitted:</span>{" "}
                  {submitted}
                </p>

                <div className="mt-2">
                  <p className="font-semibold">Reason:</p>
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {sug.reason || "—"}
                  </p>
                </div>

                {sug.link1 && (
                  <p className="mt-2">
                    <span className="font-semibold">Proof 1:</span>{" "}
                    <a
                      href={sug.link1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 underline break-all"
                    >
                      {sug.link1}
                    </a>
                  </p>
                )}
                {sug.link2 && (
                  <p className="mt-1">
                    <span className="font-semibold">Proof 2:</span>{" "}
                    <a
                      href={sug.link2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 underline break-all"
                    >
                      {sug.link2}
                    </a>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}







