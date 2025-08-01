"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface UpgradeRequest {
  ticket: string;
  type: "E" | "N" | "S";
  name: string;
  symbol: string;
  tokenAddress: string;
  creator: string;
  proof1: string;
  proof2?: string;
  requestedLevel: number;
  currentLevel?: number;
  submitted?: string;
  timestamp?: number;
  status: "pending" | "Closed - Approved" | "Closed - Rejected";
}

export default function DAOUpgradeInbox() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      console.log("📡 Fetching pending upgrade requests...");
      const res = await axios.get("/api/dao/get-pending-upgrade-requests");
      console.log("📥 Response data:", res.data);
      setRequests(res.data.pending);
    } catch (err) {
      console.error("❌ Failed to fetch requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (ticket: UpgradeRequest) => {
    console.log("🟢 Approve initiated for ticket:", ticket.ticket);

    try {
      const res = await axios.post("/api/dao/handle-existing-upgrade-decision", {
        ticket: ticket.ticket,
        decision: "approved",
        daoNotes: "DAO approved and verified ✅"
      });

      console.log("✅ Ticket approved:", res.data);
      alert(`✅ Ticket Approved: ${ticket.ticket}`);
      fetchRequests();
    } catch (err) {
      console.error("🚨 Approval failed:", err);
      alert("❌ Approval failed. See console.");
    }
  };

  const handleReject = async (ticket: UpgradeRequest) => {
    console.log("🔴 Reject initiated for ticket:", ticket.ticket);

    try {
      const res = await axios.post("/api/dao/handle-existing-upgrade-decision", {
        ticket: ticket.ticket,
        decision: "rejected",
        daoNotes: "DAO rejected the request ❌"
      });

      console.log("🛑 Ticket rejected:", res.data);
      alert(`❌ Ticket Rejected: ${ticket.ticket}`);
      fetchRequests();
    } catch (err) {
      console.error("🚨 Rejection failed:", err);
      alert("❌ Rejection failed. See console.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📥 Upgrade Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-400">No pending requests.</p>
      ) : (
        requests.map((ticket) => {
          console.log("🧾 Rendering ticket:", ticket);

          const normalizedStatus =
            ticket.status === "pending"
              ? "Pending"
              : ticket.status === "Closed - Approved"
              ? "Closed - Approved"
              : ticket.status === "Closed - Rejected"
              ? "Closed - Rejected"
              : "Unknown";

          return (
            <div
              key={ticket.ticket}
              className="border border-gray-700 p-4 mb-4 rounded"
            >
              <p><strong>Ticket:</strong> {ticket.ticket}</p>
              <p><strong>Name:</strong> {ticket.name}</p>
              <p><strong>Symbol:</strong> {ticket.symbol}</p>
              <p><strong>Address:</strong> {ticket.tokenAddress}</p>
              <p><strong>Creator:</strong> {ticket.creator}</p>
              <p><strong>Level:</strong> {ticket.currentLevel ?? "N/A"} → {ticket.requestedLevel}</p>
              <p><strong>Status:</strong> {normalizedStatus}</p>
              <p><strong>Submitted:</strong> {
                ticket.submitted
                  ? new Date(ticket.submitted).toLocaleString()
                  : ticket.timestamp
                  ? new Date(Number(ticket.timestamp) * 1000).toLocaleString()
                  : "—"
              }</p>

              <p>
                <strong>Proof 1:</strong>{" "}
                <a
                  href={ticket.proof1}
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  {ticket.proof1}
                </a>
              </p>
              {ticket.proof2 && (
                <p>
                  <strong>Proof 2:</strong>{" "}
                  <a
                    href={ticket.proof2}
                    target="_blank"
                    className="text-blue-400 underline"
                  >
                    {ticket.proof2}
                  </a>
                </p>
              )}
              <div className="mt-3 flex gap-4">
                <button
                  className="bg-green-600 px-4 py-2 rounded"
                  onClick={() => handleApprove(ticket)}
                  disabled={loading}
                >
                  ✅ Approve
                </button>
                <button
                  className="bg-red-600 px-4 py-2 rounded"
                  onClick={() => handleReject(ticket)}
                  disabled={loading}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}





