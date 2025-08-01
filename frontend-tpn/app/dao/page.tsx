"use client";

import React from "react";
import TPNLogo from "@/components/shared/TPNLogo";
import TPNFooter from "@/components/shared/TPNFooter";
import DAOTicketInbox from "@/components/dao/DAOTicketInbox";
import DAOExistingUpgradeForm from "@/components/dao/DAOExistingUpgradeForm";
import DAORegistryViewer from "@/components/dao/DAORegistryViewer";
import DAOCreatorTokens from "@/components/dao/DAOCreatorTokens";
import DAOInboxSuggestions from "@/components/dao/DAOInboxSuggestions";
import PublicSuggestionBox from "@/components/dao/PublicSuggestionBox";
import DAOHealthCheck from "@/components/dao/DAOHealthCheck";

export default function DAOControlRoomPage() {
  return (
    <>
      <main className="min-h-screen bg-black text-white p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <TPNLogo size={40} />
          <h1 className="text-3xl font-bold tracking-tight">DAO Control Room</h1>
        </div>

        {/* 🗳️ Governance Actions */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">🗳️ Governance Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DAOTicketInbox />
            <DAOExistingUpgradeForm />
          </div>
        </section>

        {/* 🔰 Registry & Creator Tools */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">🔰 Registry & Creator Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DAORegistryViewer />
            <DAOCreatorTokens />
          </div>
        </section>

        {/* 🧠 DAO Suggestions */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">🧠 DAO Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DAOInboxSuggestions />
            <PublicSuggestionBox />
          </div>
        </section>

        {/* 🔎 Registry Health Report */}
        <section className="mb-20">
          <h2 className="text-xl font-semibold mb-4">🔎 Registry Health Report</h2>
          <div className="bg-zinc-900 p-4 rounded-xl shadow-md">
            <DAOHealthCheck />
          </div>
        </section>
      </main>

      {/* 🔒 Footer Signature */}
      <TPNFooter />
    </>
  );
}
















