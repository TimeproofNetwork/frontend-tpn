"use client";

import React from "react";
import TPNLogo from "@/components/shared/TPNLogo";
import TPNFooter from "@/components/shared/TPNFooter";
import ScanTokenTrust from "@/components/intel/ScanTokenTrust";
import ScanSuspicionDEX from "@/components/intel/ScanSuspicionDEX";
import CreatorTrustScore from "@/components/intel/CreatorTrustScore";
import CreatorClusterStats from "@/components/intel/CreatorClusterStats";

export default function IntelligenceDashboard() {
  return (
    <>
      <main className="min-h-screen bg-black text-white p-6">
  {/* Header */}
  <div className="flex items-center gap-3 mb-10">
    <TPNLogo size={40} />
    <h1 className="text-3xl font-bold tracking-tight">TPN Intelligence Suite</h1>
  </div>
  
        {/* Section 1: Token Trust Analysis */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-semibold">📦 Token Trust Analysis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScanTokenTrust />
            <ScanSuspicionDEX />
          </div>
        </section>

        {/* Section 2: Creator Behavior Analytics */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-semibold">🧑‍💻 Creator Behavior Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreatorTrustScore />
            <CreatorClusterStats />
          </div>
        </section>
      </main>

      {/* Footer Signature */}
      <TPNFooter />
    </>
  );
}




