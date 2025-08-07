"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import axios from "axios";

const validExchangeDomains = [
  "binance.com",
  "coinbase.com",
  "crypto.com",
  "kucoin.com",
  "kraken.com",
  "bybit.com",
  "bitfinex.com",
  "okx.com",
  "bitstamp.net",
  "gemini.com"
];

const validAuditDomains = [
  "certik.com",
  "trailofbits.com",
  "quantstamp.com",
  "hacken.io",
  "slowmist.io"
];

function isValidDomain(url: string, validDomains: string[]): boolean {
  try {
    const parsed = new URL(url);
    return validDomains.some(domain => parsed.hostname.includes(domain));
  } catch (err) {
    return false;
  }
}

function isProofLinkMatching(url: string, name: string, symbol: string): boolean {
  const cleanName = name.toLowerCase();
  const cleanSymbol = symbol.toLowerCase();
  return url.toLowerCase().includes(cleanName) || url.toLowerCase().includes(cleanSymbol);
}

export default function DAOExistingUpgradeForm() {
  const { address, isConnected } = useAccount();

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    tokenAddress: "",
    proof1: "",
    proof2: "",
    requestedLevel: ""
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error" | "mismatch">("idle");
  const [ticketId, setTicketId] = useState<string | null>(null);

  const sanitize = (str: string) => str?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      alert("⚠️ Connect your wallet to submit an upgrade request.");
      return;
    }

    const { name, symbol, proof1, proof2, requestedLevel } = formData;
    const level = Number(requestedLevel);
    const cleanName = sanitize(name);
    const cleanSymbol = sanitize(symbol);
    const proofExchange = proof1.trim();
    const proofAudit = proof2.trim();

// ✅ Proof checks
if (level === 2) {
  if (!proofExchange) {
    return alert("Level 2 requires Exchange Verification Link.");
  }
  if (!isValidDomain(proofExchange, validExchangeDomains)) {
    return alert("❌ Invalid Exchange Verification Link. Must be from a recognized exchange domain.");
  }
  if (!isProofLinkMatching(proofExchange, cleanName, cleanSymbol)) {
    return alert("❌ Exchange link must mention token name or symbol.");
  }
}

if (level === 3) {
  if (!proofExchange || !proofAudit) {
    return alert("Level 3 requires both Exchange and Audit Verification Links.");
  }
  if (!isValidDomain(proofExchange, validExchangeDomains)) {
    return alert("❌ Invalid Exchange Verification Link. Must be from a recognized exchange domain.");
  }
  if (!isValidDomain(proofAudit, validAuditDomains)) {
    return alert("❌ Invalid Audit Verification Link. Must be from a trusted audit provider.");
  }
  if (!isProofLinkMatching(proofExchange, cleanName, cleanSymbol)) {
    return alert("❌ Exchange link must mention token name or symbol.");
  }
  if (!isProofLinkMatching(proofAudit, cleanName, cleanSymbol)) {
  alert("⚠️ Audit link does not appear to mention your token name or symbol. Please double-check this before proceeding. DAO may reject invalid proofs.");
  // optional: send user back to the audit field to fix
  // (document.querySelector<HTMLInputElement>('input[name="proof2"]')?.focus());
  return; // ⬅️ critical: block submission
}

}
    if (!name || !symbol || !proof1 || !requestedLevel) {
      return alert("⚠️ Fill in all required fields. Proof1 and level are mandatory.");
    }

    if (level !== 2 && level !== 3) {
      return alert("⚠️ Requested level must be 2 or 3.");
    }

    if (level === 3 && !proof2) {
      return alert("⚠️ Level 3 upgrade requires both Proof1 and Proof2.");
    }

    try {
      setStatus("submitting");

      console.log("🔍 Verifying fingerprint via /api/dao/getTokenInfo");
      const resInfo = await axios.post("/api/dao/getTokenInfo", {
  tokenAddress: formData.tokenAddress.trim()
});

const info = resInfo.data;
console.log("📬 Fingerprint check result:", info);

if (!info || !info.tokenAddress) {
  setStatus("mismatch");
  return alert("❌ Token not registered onchain. Cannot upgrade unregistered token.");
}

// Inject resolved tokenAddress into formData
setFormData((prev) => ({ ...prev, tokenAddress: info.tokenAddress }));


      if (!info || !info.tokenAddress || !info.fingerprint) {
        setStatus("mismatch");
        return alert("❌ No matching registered token found for given name + symbol.");
      }

  console.log("🔎 Fingerprint object from backend:", info);
  const matchFingerprint =
  info &&
  info.fingerprint &&
  sanitize(name) === info.fingerprint.name &&
  sanitize(symbol) === info.fingerprint.symbol &&
  info.tokenAddress === formData.tokenAddress.trim() &&
  info.creator?.toLowerCase?.() === address.toLowerCase();

      if (!matchFingerprint) {
        console.warn("❌ Fingerprint mismatch:", {
          input: {
            name: sanitize(name),
            symbol: sanitize(symbol),
            address: formData.tokenAddress,
            creator: address
          },
          registry: {
            name: info.fingerprint.name,
            symbol: info.fingerprint.symbol,
            address: info.tokenAddress,
            creator: info.creator
          }
        });
        setStatus("mismatch");
        return;
      }
      // 🛡️ Check if token already has a pending or closed upgrade ticket
  let checkRes;
try {
  checkRes = await axios.post("/api/dao/checkExistingTicket", {
    type: "E",
    tokenAddress: info.tokenAddress.trim(),
    name: sanitize(name),
    symbol: sanitize(symbol),
    creator: address.toLowerCase()
  });
} catch (e) {
  console.error("❌ Ticket check failed:", e);
setStatus("error");
alert("❌ Failed to verify duplicate status. Please try again.");
setStatus("idle"); // 👈 immediately unlock
return;
}

if (checkRes.data?.exists) {
  setStatus("error");
  return alert("⚠️ Upgrade request already exists for this token.");
}

// 🛡️ FINAL GATE: Recheck against existing tickets using sanitized data + canonical address
console.log("🚫 Final double-check against duplicate DAO tickets...");
const verifyDuplicate = await axios.post("/api/dao/checkExistingTicket", {
  type: "E",
  tokenAddress: info.tokenAddress.trim(),
  name: sanitize(name),
  symbol: sanitize(symbol),
  creator: address.toLowerCase()
});

if (verifyDuplicate.data?.exists) {
  setStatus("error");
  return alert("❌ Upgrade already submitted. Cannot submit duplicate ticket.");
}

      // 🧬 Construct canonical fingerprint
const uniqueFingerprint = `${sanitize(name)}|${sanitize(symbol)}|${info.tokenAddress.toLowerCase()}|${address.toLowerCase()}`;

// 📨 Final payload with fingerprint included
const payload = {
  type: "E",
  name: name.trim(),
  symbol: symbol.trim(),
  tokenAddress: info.tokenAddress,
  creator: address,
  proof1: proof1.trim(),
  proof2: proof2.trim(),
  requestedLevel: level,
  uniqueFingerprint // ⬅️ new field
};

      const res = await axios.post("/api/dao/request-upgrade", payload);
      const ticket = res.data?.ticket?.ticket;

      console.log("✅ Upgrade request submitted:", ticket);
      setTicketId(ticket?.replace(/^E#/, "") || null);
      setStatus("submitted");
        } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Unknown error";

      // Check if backend returned a fingerprint mismatch
      if (message.includes("Fingerprint mismatch")) {
        setStatus("mismatch");
      } else {
        setStatus("error");
      }

      console.error("❌ Upgrade request failed:", message);
alert(`❌ ${message}`);
setStatus("error"); // 🔒 prevents infinite retry or stuck state
    }

  };

  return (
    <div className="flex flex-col justify-between bg-[#111827] text-white p-6 rounded-xl shadow-md h-full w-full min-h-[560px]">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <img
            src="/emblem.png"
            alt="TPN"
            className="w-[1.15em] h-[1.15em] mr-2 align-middle"
          />
          Request Upgrade for Existing Token
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            name="name"
            autoComplete="off"
            placeholder="Token Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded placeholder-gray-400"
          />
          <input
            type="text"
            name="symbol"
            autoComplete="off"
            placeholder="Symbol"
            value={formData.symbol}
            onChange={handleChange}
            className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded placeholder-gray-400"
          />
          <input
            type="text"
            name="tokenAddress"
            value={formData.tokenAddress}
            onChange={handleChange}
            placeholder="Registered Token Address"
            className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded placeholder-gray-400"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="creator"
              placeholder="Connected Creator Wallet"
              value={address || ""}
              readOnly
              disabled
              className="w-full p-2 bg-gray-900 text-gray-400 border border-gray-700 rounded"
            />
            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              title="Refresh Wallet"
            >
              🔄
            </button>
          </div>

          <input
            type="text"
            name="proof1"
            placeholder="Exchange Verification Link"
            autoComplete="off"
            value={formData.proof1}
            onChange={handleChange}
            className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded placeholder-gray-400"
          />
          <input
            type="text"
            name="proof2"
            placeholder="Audit Verification Link"
            autoComplete="off"
            value={formData.proof2}
            onChange={handleChange}
            className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded placeholder-gray-400"
          />
          <select
            name="requestedLevel"
            value={formData.requestedLevel}
            onChange={handleChange}
            className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded"
          >
            <option value="">Select Requested Level</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        {status === "submitted" && ticketId && (
          <div className="mt-4 text-green-400 font-semibold">
            ✅ Ticket Submitted: E#{ticketId}
          </div>
        )}

        {status === "mismatch" && (
          <div className="mt-4 text-red-400 font-semibold">
            ❌ Fingerprint Mismatch – Token not eligible for DAO upgrade.
          </div>
        )}
      </div>

      <button
  onClick={handleSubmit}
  disabled={status === "submitting" || status === "submitted" || status === "error"}

        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded mt-6"
      >
        {status === "submitting" ? "Submitting..." : "Submit Upgrade Request"}
      </button>
    </div>
  );

}










