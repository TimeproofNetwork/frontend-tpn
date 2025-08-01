"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type TicketType = "E" | "S" | "N";

interface Ticket {
  ticket: string;                 // "E#44" | "S#8" | "N#3"
  type: TicketType;               // "E" | "S" | "N"
  name?: string;
  symbol?: string;
  tokenAddress?: string;
  creator?: string;
  proof1?: string;
  proof2?: string;
  status: "pending" | "closed";
  timestamp?: number;
  submitted?: string;
  description?: string;
  reason?: string;

  // New fields we’ll render:
  requestedLevel?: number;        // for E tickets (from dao-tickets.json)
  ticketCode?: string;            // "S1".."S5" for Suggestion category
}

const TICKET_LABELS: Record<string, string> = {
  S1: "Upgrade Existing Token Badge",
  S2: "Quarantine or Ban Token/Creator",
  S3: "Request Self-Heal",
  S4: "Godzilla Layer Exception",
  S5: "Report Suspicious Token/Creator",
};

// Compress long labels like "Upgrade Existing Token Badge" -> "Upgrade…Badge"
function compressLabel(label?: string) {
  if (!label) return "";
  const parts = label.split(" ").filter(Boolean);
  if (parts.length < 2) return label;
  return `${parts[0]}…${parts[parts.length - 1]}`;
}

export default function DAOTicketInbox() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedType, setSelectedType] = useState<"ALL" | "E" | "N" | "S">("ALL");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/dao/getAllTickets");
      const fetched: Ticket[] = res?.data?.tickets || [];

      // Normalize timestamps (defensive) and sort newest-first, even if API already sorted
      const normalized = fetched
        .map((t) => {
          const ts =
            typeof t.timestamp === "number" && t.timestamp > 0
              ? t.timestamp
              : t.submitted
              ? Date.parse(t.submitted)
              : undefined;
          return { ...t, timestamp: ts };
        })
        .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

      setTickets(normalized);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      toast.error("❌ Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ticket: Ticket) => {
  try {
    await axios.post("/api/dao/update-ticket-status", {
      id: ticket.ticket,
      status: "approved",
    });
    toast.success(`✅ Ticket ${ticket.ticket} approved`);
    fetchTickets();
  } catch (err) {
    toast.error(
      `🔒 Full operational control — including Self-Heal, Top 500 Token Bans, and DAO Ban, Quarantine, and Upgrade systems — will transfer to the DAO during the mainnet transition.`
    );
  }
};

const handleReject = async (ticket: Ticket) => {
  try {
    await axios.post("/api/dao/update-ticket-status", {
      id: ticket.ticket,
      status: "rejected",
    });
    toast.success(`❌ Ticket ${ticket.ticket} rejected`);
    fetchTickets();
  } catch (err) {
    toast.error(
      `🔒 Full operational control — including Self-Heal, Top 500 Token Bans, and DAO Ban, Quarantine, and Upgrade systems — will transfer to the DAO during the mainnet transition.`
    );
  }
};

  const filteredTickets = tickets.filter((t) => {
    const statusMatch = showPendingOnly ? t.status === "pending" : true;
    const typeMatch = selectedType === "ALL" ? true : t.type === selectedType;
    return statusMatch && typeMatch;
  });

  if (loading) return <div className="text-gray-400">Loading tickets...</div>;
  if (!tickets.length) return <div className="text-gray-400">No tickets found.</div>;

  return (
    <div className="bg-[#111827] p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <img
          src="/emblem.png"
          alt="TPN"
          className="w-[1.2em] h-[1.2em] mr-2 align-middle"
        />
        DAO Ticket Inbox
      </h2>

      <div className="mb-4 flex gap-3 flex-wrap items-center">
        <button
          onClick={() => setShowPendingOnly(!showPendingOnly)}
          className="bg-gray-800 hover:bg-gray-700 px-4 py-1 rounded text-sm text-white border border-gray-600"
        >
          {showPendingOnly ? "Show All Tickets" : "Show Pending Only"}
        </button>

        <div className="flex gap-2">
          {["ALL", "E", "N", "S"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as "ALL" | "E" | "N" | "S")}
              className={`px-3 py-1 rounded text-sm border ${
                selectedType === type
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 border-gray-600"
              }`}
            >
              {type === "ALL"
                ? "All"
                : `${type} – ${
                    type === "E"
                      ? "Upgrade"
                      : type === "N"
                      ? "NewRegistry"
                      : "Suggestion"
                  }`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {filteredTickets.map((ticket) => {
          // Build the extra header suffix based on type:
          let extra: React.ReactNode = null;
          if (ticket.type === "E" && typeof ticket.requestedLevel === "number") {
            extra = <span className="ml-2 text-sm text-gray-400">— RL: {ticket.requestedLevel}</span>;
          } else if (ticket.type === "S" && ticket.ticketCode) {
            const label = TICKET_LABELS[ticket.ticketCode] || ticket.ticketCode;
            extra = (
              <span className="ml-2 text-sm text-gray-400">
                — {ticket.ticketCode}: {compressLabel(label)}
              </span>
            );
          }

          return (
            <div key={ticket.ticket} className="bg-black p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-mono text-sm text-purple-400">
                    {ticket.ticket}
                  </span>
                  <span className="ml-2 text-sm text-gray-400">
                    {ticket.status === "pending" ? "🟠 Pending" : "✅ Closed"}
                  </span>
                  {extra}
                </div>
                <div className="text-xs text-gray-500">
                  {ticket.timestamp
                    ? new Date(ticket.timestamp).toLocaleString()
                    : ticket.submitted
                    ? new Date(ticket.submitted).toLocaleString()
                    : "—"}
                </div>
              </div>

              {/* Title block: type-aware */}
              <div className="text-sm mb-1">
                {ticket.type === "S" ? (
                  <>
                    <strong>Suggestion:</strong>{" "}
                    {ticket.description?.trim() ||
                      ticket.reason?.trim() ||
                      "User suggestion"}
                  </>
                ) : (
                  <>
                    <strong>Name:</strong>{" "}
                    {ticket.name ? ticket.name : "—"}
                    {typeof ticket.symbol === "string" ? ` (${ticket.symbol})` : ""}
                  </>
                )}
              </div>

              {ticket.tokenAddress && (
                <div className="text-sm mb-1">
                  <strong>Address:</strong>{" "}
                  <span className="text-green-400">{ticket.tokenAddress}</span>
                </div>
              )}

              {ticket.creator && (
                <div className="text-sm text-gray-400 mb-2">
                  Requester: {ticket.creator}
                </div>
              )}

              {ticket.description && ticket.type !== "S" && (
                <div className="text-xs text-blue-300 mb-1">📝 {ticket.description}</div>
              )}
              {ticket.reason && ticket.type !== "S" && (
                <div className="text-xs text-yellow-400 mb-2">💡 Reason: {ticket.reason}</div>
              )}

              {ticket.proof1 && (
                <div className="text-xs text-blue-400 mb-1">
                  🔗 Proof 1:{" "}
                  <a
                    href={ticket.proof1}
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </div>
              )}
              {ticket.proof2 && (
                <div className="text-xs text-blue-400 mb-2">
                  🔍 Proof 2:{" "}
                  <a
                    href={ticket.proof2}
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </div>
              )}

              {ticket.status === "pending" && (
                <div className="flex gap-4 mt-3">
                  <button
                    onClick={() => handleApprove(ticket)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(ticket)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}








