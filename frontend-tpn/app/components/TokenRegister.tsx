// /components/TokenRegister.tsx

"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSigner
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ethers } from "ethers";
import TPNTokenAbi from "../../abi/TPNToken.json";
import TokenRegistryAbi from "../../abi/TokenRegistry.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CheckTPNBalance from "@/components/CheckTPNBalance";

const TPN_TOKEN = process.env.NEXT_PUBLIC_TPN_TOKEN as `0x${string}`;
const BADGE_NFT = process.env.NEXT_PUBLIC_BADGE_NFT as `0x${string}`;
const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY as `0x${string}`;

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

export default function TokenRegister() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [trustLevel, setTrustLevel] = useState("1");
  const [proofExchange, setProofExchange] = useState("");
  const [proofAudit, setProofAudit] = useState("");
  const [status, setStatus] = useState("");
  const [badgeInfo, setBadgeInfo] = useState<{ id: string; level: string } | null>(null);

  const { data: signer } = useSigner();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      setName("");
      setSymbol("");
      setTotalSupply("");
      setProofExchange("");
      setProofAudit("");
      setTrustLevel("1");
      setStatus("");
      setBadgeInfo(null);
    }
  }, [isConnected]);

  const sanitize = (text: string) =>
    text.trim().toLowerCase().replace(/[^a-z0-9]/gi, "");

  const isValidDomain = (url: string, validDomains: string[]) => {
    try {
      const parsed = new URL(url);
      return validDomains.some(domain => parsed.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const isProofLinkMatching = (url: string, cleanName: string, cleanSymbol: string) => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes(cleanName) || lowerUrl.includes(cleanSymbol);
  };

  const handleRegister = async () => {
    if (!isConnected) {
      document.getElementById("wallet-trigger")?.click();
      return;
    }

    try {
      if (!signer) return alert("Wallet not connected.");
      if (!name.trim() || !symbol.trim()) return alert("Name and Symbol are mandatory.");
      if (!totalSupply || isNaN(Number(totalSupply)) || Number(totalSupply) <= 0) {
        return alert("Please enter a valid total token supply.");
      }

      const cleanName = sanitize(name);
const cleanSymbol = sanitize(symbol);

if (trustLevel === "2") {
  if (!proofExchange.trim()) {
    return alert("Level 2 requires Exchange Verification Link.");
  }
  if (!isValidDomain(proofExchange, validExchangeDomains)) {
    return alert("❌ Invalid Exchange Verification Link. Must be from a recognized exchange domain.");
  }
  if (!isProofLinkMatching(proofExchange, cleanName, cleanSymbol)) {
    return alert("❌ Exchange link must mention token name or symbol.");
  }
}

if (trustLevel === "3") {
  if (!proofExchange.trim() || !proofAudit.trim()) {
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
    // Proceed without blocking — soft warning
  }
}

      const confirm = window.confirm(
        `🧼 Sanitized Format:\n\nName: ${cleanName}\nSymbol: ${cleanSymbol}\n\nProceed with registration?`
      );
      if (!confirm) return;

      setStatus("⏳ Starting token deployment...");

      const TokenFactory = new ethers.ContractFactory(
        TPNTokenAbi.abi,
        TPNTokenAbi.bytecode,
        signer
      );

      const token = await TokenFactory.deploy(
        cleanName,
        cleanSymbol,
        18,
        ethers.utils.parseUnits(totalSupply, 18),
        await signer.getAddress(),
        {
          maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
          maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei")
        }
      );

      await token.deployed();
      setStatus(`📌 Token deployed at: ${token.address}\n💬 Estimated ~8 seconds to approve TPN...`);

      const TPN = new ethers.Contract(TPN_TOKEN, TPNTokenAbi.abi, signer);
      const approveTx = await TPN.approve(
        TOKEN_REGISTRY,
        ethers.utils.parseUnits("100", 18)
      );
      await approveTx.wait();
      setStatus((prev) => prev + `\n✅ Approved 100 TPN\n💬 Estimated ~8 seconds to register & mint badge...`);

      const Registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi.abi, signer);
      const tx = await Registry.registerToken(
        cleanName,
        cleanSymbol,
        token.address,
        parseInt(trustLevel),
        {
          maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
          maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei")
        }
      );

      const receipt = await tx.wait();
      setStatus((prev) => prev + `\n✅ Registered & Badge Minted 🏅`);

      const event = receipt?.logs
        .map((log: ethers.providers.Log) => {
          try {
            return Registry.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed: any) => parsed?.name === "BadgeMinted");

      if (event) {
        const badgeId = event.args?.badgeId?.toString() || "unknown";
        const level = event.args?.trustLevel?.toString() || trustLevel;
        setBadgeInfo({ id: badgeId, level });
        setStatus((prev) => prev + `\n🏷️ Badge Token ID: ${badgeId} | Level: ${level}`);
      }

    } catch (err: any) {
      const reason =
        err?.error?.message ||
        err?.reason ||
        err?.data?.message ||
        err.message ||
        "Unknown";
      setStatus("❌ Error: " + reason);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-black text-white rounded-2xl shadow-2xl relative">
      <div className="flex items-center justify-center mb-6 space-x-2">
        <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <img src="/emblem.png" alt="TPN Emblem" className="w-6 h-6 md:w-7 md:h-7" />
          Register a New Token
        </h2>
      </div>

      <input type="text" placeholder="Token Name" className="w-full mb-3 p-3 rounded bg-gray-900 border border-gray-700" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Token Symbol" className="w-full mb-3 p-3 rounded bg-gray-900 border border-gray-700" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      <input type="text" placeholder="Total Token Supply" className="w-full mb-3 p-3 rounded bg-gray-900 border border-gray-700" value={totalSupply} onChange={(e) => setTotalSupply(e.target.value)} />

      <select className="w-full mb-3 p-3 rounded bg-gray-900 border border-gray-700" value={trustLevel} onChange={(e) => setTrustLevel(e.target.value)}>
        <option value="1">🟡 Level 1: Basic</option>
        <option value="2">🟢 Level 2: Exchange Verified</option>
        <option value="3">🟣 Level 3: Audited & Exchange Verified</option>
      </select>

      {(trustLevel === "2" || trustLevel === "3") && (
        <input type="text" placeholder="Exchange Verification Link" className="w-full mb-3 p-3 rounded bg-gray-900 border border-gray-700" value={proofExchange} onChange={(e) => setProofExchange(e.target.value)} />
      )}

      {trustLevel === "3" && (
        <input type="text" placeholder="Audit Verification Link" className="w-full mb-3 p-3 rounded bg-gray-900 border border-gray-700" value={proofAudit} onChange={(e) => setProofAudit(e.target.value)} />
      )}

      <CheckTPNBalance />

      <button onClick={handleRegister} className="w-full bg-purple-700 hover:bg-purple-600 transition p-3 rounded font-semibold shadow-md hover:shadow-purple-700 active:scale-95 mt-4">
        🚀 Register Token (100 TPN)
      </button>

      {status && (
        <div className="mt-4 text-sm text-purple-300 whitespace-pre-wrap break-words">
          {status}
        </div>
      )}

      {badgeInfo && (
        <div className="mt-4 text-center text-green-400 font-semibold">
          🎖️ Badge ID #{badgeInfo.id} | Level {badgeInfo.level}
        </div>
      )}

      <div className="hidden">
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button id="wallet-trigger" onClick={openConnectModal}>Connect Hidden</button>
          )}
        </ConnectButton.Custom>
      </div>

      <div className="mt-8 flex justify-center">
        <ConnectButton />
      </div>
    </div>
  );
}
































