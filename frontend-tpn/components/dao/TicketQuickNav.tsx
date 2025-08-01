"use client";

import { useState } from "react";

export default function TicketQuickNav() {
  const [selected, setSelected] = useState("");

  const handleNavigate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sectionId = e.target.value;
    setSelected(sectionId);

    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
      <label className="text-sm font-medium text-gray-400">Quick Ticket Navigation:</label>
      <select
        value={selected}
        onChange={handleNavigate}
        className="bg-black border border-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">-- Select a Category --</option>
        <option value="n-requests">🆕 N# New Token Requests</option>
        <option value="e-upgrades">🔁 E# Existing Upgrade Requests</option>
        <option value="s-suggestions">📩 S# Suggestions & Actions</option>
      </select>
    </div>
  );
}
