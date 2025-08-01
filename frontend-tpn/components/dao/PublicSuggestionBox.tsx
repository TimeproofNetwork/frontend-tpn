"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

const ticketOptions = [
  { value: "S1", label: "Upgrade Existing Token Badge" },
  { value: "S2", label: "Quarantine or Ban Token/Creator" },
  { value: "S3", label: "Request Self-Heal" },
  { value: "S4", label: "Godzilla Layer Exception" },
  { value: "S5", label: "Report Suspicious Token/Creator" },
];

export default function PublicSuggestionBox() {
  
  const { address, isConnected } = useAccount();


  const [formData, setFormData] = useState({
    ticket: "S1",
    token: "",
    reason: "",
    link1: "",
    link2: "",
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  // Require connected wallet
  if (!isConnected || !address) {
    setOutput("❗ Connect wallet before submitting a suggestion.");
    return;
  }

  // Frontend required-field checks
  const ticket = formData.ticket?.trim();
  const token = formData.token?.trim();
  const reason = formData.reason?.trim();
  const link1 = formData.link1?.trim();
  const link2 = formData.link2?.trim();

  if (!ticket || !token || !reason || !link1) {
    setOutput("❗ Ticket Category, Token/Creator, Reason and Proof Link 1 are required.");
    return;
  }

  setLoading(true);
  setOutput("");

  try {
    const res = await fetch("/api/dao/submitPublicSuggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticket,
        token,
        reason,
        link1,
        link2,
        requester: address, // ✅ auto-attach connected wallet
      }),
    });

    const data = await res.json();

    if (res.status === 409) {
      setOutput("⚠️ A suggestion for this token is already pending. Cannot submit again.");
    } else if (!res.ok) {
      setOutput(`❌ Submission failed.${data?.error ? ` ${data.error}` : ""}`);
    } else {
      const ticketId: string | undefined = data?.ticketId; // e.g., "S#4"
      setOutput(`✅ Suggestion submitted: ${ticketId || "S#?"}`);

      // Reset inputs (keep selected category)
      setFormData({
        ticket: formData.ticket,
        token: "",
        reason: "",
        link1: "",
        link2: "",
      });
    }
  } catch {
    setOutput("❌ Submission error.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <img
          src="/emblem.png"
          alt="TPN"
          className="w-[1.15em] h-[1.15em] mr-2 align-middle"
        />
        Submit a DAO Suggestion
      </h3>
            {/* Connected requester */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Requester</label>
        <input
          type="text"
          value={
            address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "Not connected"
          }
          readOnly
          disabled
          className="w-full bg-black text-gray-400 border border-gray-700 px-4 py-2 rounded"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ticket Category</label>
          <select
            name="ticket"
            value={formData.ticket}
            onChange={handleChange}
            className="w-full bg-black text-white border border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {ticketOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Token / Creator Address</label>
          <input
            type="text"
            name="token"
            placeholder="0x..."
            value={formData.token}
            onChange={handleChange}
            required
            className="w-full bg-black text-white border border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
  <label className="block text-sm font-medium mb-1">Reason / Justification</label>
  <textarea
    name="reason"
    placeholder="Provide clear explanation..."
    value={formData.reason}
    onChange={handleChange}
    required   // ← add this
    className="w-full bg-black text-white border border-gray-700 px-4 py-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
</div>

        <div>
  <label className="block text-sm font-medium mb-1">Proof Link 1</label>
  <input
    type="text"
    name="link1"
    placeholder="https://..."
    value={formData.link1}
    onChange={handleChange}
    required   // ← add this
    className="w-full bg-black text-white border border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
</div>

        <div>
          <label className="block text-sm font-medium mb-1">Proof Link 2 (Optional)</label>
          <input
            type="text"
            name="link2"
            placeholder="https://..."
            value={formData.link2}
            onChange={handleChange}
            className="w-full bg-black text-white border border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "⏳ Submitting..." : "Submit Suggestion"}
      </button>

      {output && (
        <div className="mt-4 p-3 bg-black border border-gray-700 rounded text-sm whitespace-pre-wrap">
          {output}
        </div>
      )}
    </div>
  );
}

