"use client";

import { useEffect, useState } from "react";

interface SelfHealReport {
  ranAt: number;           // Timestamp when script ran
  duration?: string;       // ⏱️ Duration string (e.g., "1.2s")
  ok?: boolean;            // ✅ Success flag
  lines: string[];         // 📜 Output lines
}

interface GodzillaReport {
  ranAt?: number;         // ✅ Timestamp of execution
  lines: string[];        // ✅ Output lines
  output?: string;        // (optional) any summary output
  success?: boolean;      // (optional) execution status
}

export default function DAOHealthCheck() {
  const [selfHeal, setSelfHeal] = useState<SelfHealReport | null>(null);
  const [godzilla, setGodzilla] = useState<GodzillaReport | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res1 = await fetch("/api/dao/get-self-heal-report");
        const j1 = await res1.json();
        setSelfHeal(j1?.report ?? null);

        const res2 = await fetch("/api/dao/get-godzilla-ban-update");

        const j2 = await res2.json();
        setGodzilla(j2?.report ?? null);
      } catch (err) {
        console.error("❌ Failed to fetch DAO health reports:", err);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="space-y-8">
      {/* DAO Health Check */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <img
              src="/emblem.png"
              alt="TPN"
              className="w-[1.15em] h-[1.15em] mr-2"
            />
            DAO Health Check
          </h3>
        </div>
        <p className="text-zinc-400 text-sm mb-2">
          🔐 Full operational control (including the Self–Heal, Top 500 Token Bans, and DAOBan, Quarantine and Upgrade systems) will be transferred to the DAO during the mainnet transition.
        </p>

        <div className="text-sm text-gray-400 mb-2">
          Last checked:{" "}
          {selfHeal?.ranAt ? new Date(selfHeal.ranAt).toLocaleString() : "—"}
        </div>

        <div className="mt-4 bg-black/40 border border-gray-800 rounded p-4 text-green-400 text-sm font-mono whitespace-pre-wrap">
          {!selfHeal ? (
            <div className="text-gray-400">⏳ Loading Self-Heal Report...</div>
          ) : (
            selfHeal.lines.join("\n")
          )}
        </div>
      </div>

      {/* Godzilla Ban Update */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <img
              src="/emblem.png"
              alt="TPN"
              className="w-[1.15em] h-[1.15em] mr-2"
            />
            Godzilla Ban Update
          </h3>
        </div>
        <p className="text-zinc-400 text-sm mb-2">
          🔐 Full operational control (including the Self–Heal, Top 500 Token Bans, and DAOBan, Quarantine and Upgrade systems) will be transferred to the DAO during the mainnet transition.
        </p>

        <div className="text-sm text-gray-400 mb-2">
          Last run:{" "}
          {godzilla?.ranAt? new Date(godzilla.ranAt).toLocaleString() : "—"}
       </div>

        <div className="mt-4 bg-black/40 border border-gray-800 rounded p-4 text-green-400 text-sm font-mono whitespace-pre-wrap">
          {!godzilla ? (
            <div className="text-gray-400">⏳ Loading Godzilla Ban Report...</div>
          ) : (
            godzilla.lines.join("\n")
          )}
        </div>
      </div>
    </div>
  );
}















