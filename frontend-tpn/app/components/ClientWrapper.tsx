"use client";

import { useEffect } from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("error", (e) => {
        if (e.message && e.message.includes("wss://relay.walletconnect.com")) {
          e.preventDefault();
          console.warn("⚠️ WalletConnect relay unreachable — suppressed.");
        }
      });
    }
  }, []);

  return <>{children}</>;
}
