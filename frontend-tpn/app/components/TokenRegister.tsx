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
import { AlertTriangle } from 'lucide-react';
import CheckTPNBalance from "@/components/CheckTPNBalance";
import sanitize from "../../utils/sanitizeInputs";


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
  const [showHelp, setShowHelp] = useState(false);

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

    // ✅ Sanitize name and symbol
    const cleanName = sanitize(name);
    const cleanSymbol = sanitize(symbol);

    // ✅ Reject if sanitized result is blank
    if (!cleanName || !cleanSymbol) {
      alert("❌ Token name and symbol are required.");
      return;
    }

    // ✅ Reject if sanitized length mismatches original (prevents contract Layer1 revert)
    if (cleanName.length !== name.length || cleanSymbol.length !== symbol.length) {
      alert("❌ Sanitized mismatch: Please remove emojis, spaces, or special characters.");
      return;
    }
        // ✅ Debugging Output — Log sanitized and raw values before contract call
    console.log("🚀 TPN Registration Debug Start");
    console.log("🧾 Raw Name:", name);
    console.log("🧾 Raw Symbol:", symbol);
    console.log("🧼 Sanitized Name:", cleanName);
    console.log("🧼 Sanitized Symbol:", cleanSymbol);
    console.log("📏 Raw Name Length:", name.length, "| Sanitized:", cleanName.length);
    console.log("📏 Raw Symbol Length:", symbol.length, "| Sanitized:", cleanSymbol.length);
    console.log("🧮 Total Supply:", totalSupply);
    console.log("📬 Proof 1:", proofExchange);
    console.log("📬 Proof 2:", proofAudit);
    console.log("💼 Signer Address:", await signer.getAddress());
    console.log("💡 Proceeding to contract interaction...");


    // ✅ Proceed with contract interaction...
    
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

      <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-md text-sm text-gray-300 leading-relaxed">
     <p className="mb-2">
       <AlertTriangle className="inline-block w-5 h-5 text-yellow-400 mr-2" />
       <span className="font-semibold">Caution:</span> You need a minimum of <span className="font-semibold">100 TPN</span> in your wallet to register a token.
     </p>
        <p className="mb-2">
          If this is your first time—or anytime—you can request free 100 TPN using your wallet address here:<br />
          🔗 <a
            href="https://forms.gle/z1ZyEiyvikhKPdWi7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Request Free TPN
          </a>
        </p>
        <p className="mb-2">
          Even if your MetaMask doesn’t show your TPN balance, our system reads your balance directly from on-chain data. 👉 Click the <span className="font-semibold">Check TPN Balance</span> button above to see your wallet balance.
        </p>
        <p>
          Alternatively, you can verify your TPN balance manually on:<br />
          🔗 <a
            href="https://sepolia.etherscan.io/address/YOUR_WALLET_ADDRESS"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Sepolia Etherscan
          </a>
        </p>
        <div className="mt-3 text-sm text-gray-400">
          <button onClick={() => setShowHelp(!showHelp)} className="underline text-blue-400 hover:text-blue-300">
            {showHelp ? "Hide MetaMask Balance Help ▲" : "📝 How to View TPN in MetaMask ▼"}
          </button>
          {showHelp && (
            <div className="mt-2 bg-gray-900 p-3 rounded border border-gray-700 text-gray-300 leading-relaxed shadow">
              <p className="mb-2">1️⃣ Select <strong>Network</strong> → enable <strong>Show test networks</strong> → choose <strong>Sepolia</strong>.</p>
              <p className="mb-2">2️⃣ Click on <strong>Tokens</strong> → then the <strong>three dots</strong> → <strong>Import Tokens</strong>.</p>
              <p className="mb-2">3️⃣ Paste this TPN Token Address:<br /><span className="break-all text-yellow-300">0xA7e3976928332e90DE144f6d4c6393B64E37bf6C</span></p>
              <p>4️⃣ Done! Your TPN balance will now appear in MetaMask.</p>
            </div>
          )}
        </div>
      </div>

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

































