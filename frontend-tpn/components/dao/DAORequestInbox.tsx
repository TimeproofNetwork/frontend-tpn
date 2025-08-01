"use client";

import { useEffect, useState } from "react";

interface RequestTicket {
  name: string;
  symbol: string;
  creator: string;
  currentLevel: number;
  requestedLevel: number;
  proof1: string;
  proof2?: string;
  timestamp: string;
}

export default function DAORequestInbox() {
  const [requests, setRequests] = useState<RequestTicket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dao/getPendingRequests");
        const data = await res.json();
        setRequests(data.tickets || []);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">📥 Pending Badge Upgrade Requests</h3>

      {loading ? (
        <p className="text-sm text-gray-400">⏳ Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-400">✅ No pending requests found.</p>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {requests.map((ticket, idx) => (
            <div key={idx} className="p-4 bg-black border border-gray-700 rounded text-sm">
              <p><strong>Name:</strong> {ticket.name} ({ticket.symbol})</p>
              <p><strong>Creator:</strong> {ticket.creator}</p>
              <p><strong>Current Level:</strong> {ticket.currentLevel}</p>
              <p><strong>Requested Level:</strong> {ticket.requestedLevel}</p>
              <p>
                <strong>Proof 1:</strong>{" "}
                <a href={ticket.proof1} className="underline text-blue-400" target="_blank" rel="noopener noreferrer">
                  {ticket.proof1}
                </a>
              </p>
              {ticket.proof2 && (
                <p>
                  <strong>Proof 2:</strong>{" "}
                  <a href={ticket.proof2} className="underline text-blue-400" target="_blank" rel="noopener noreferrer">
                    {ticket.proof2}
                  </a>
                </p>
              )}
              <p><strong>Submitted:</strong> {new Date(Number(ticket.timestamp) * 1000).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

