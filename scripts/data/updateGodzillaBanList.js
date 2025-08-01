// scripts/data/updateGodzillaBanList.js

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

// ✅ Load .env from project root
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

// ✅ Safety checks
if (!process.env.ADMIN_PRIVATE_KEY) throw new Error("❌ ADMIN_PRIVATE_KEY missing in .env");
if (!process.env.SEPOLIA_RPC_URL) throw new Error("❌ SEPOLIA_RPC_URL missing in .env");
if (!process.env.NEXT_PUBLIC_TOKEN_REGISTRY) throw new Error("❌ NEXT_PUBLIC_TOKEN_REGISTRY missing in .env");

// ✅ Environment setup
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY;

// 🧼 Canonical sanitization logic
function sanitize(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ✅ IO helpers
const DATA_PATH = path.join(__dirname, "../../frontend-tpn/data/godzilla-ban.json");
function readPreviousReport() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (_) {}
  return null;
}

async function main() {
  const TokenRegistryAbi = require("../../frontend-tpn/abi/TokenRegistry.json").abi;
  const Registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi, wallet);

  // 🗂️ Prepare report in the **fallback 1:1** shape your UI expects
  const report = {
    ranAt: Date.now(),          // number
    lines: [],                  // string[]
    output: "",                 // string
    success: true,              // boolean
    txHashes: []                // string[] (added for UX convenience)
  };

  const prev = readPreviousReport();
  const KEEP_OLD_HASHES_IF_NO_TX = true;

  report.lines.push("🔒 Starting Godzilla Ban Update...");
  report.lines.push(`🧾 Registry Address: ${TOKEN_REGISTRY}`);
  report.lines.push(`🚀 Caller: ${wallet.address}`);

  console.log("🌐 Fetching top 500 tokens from CoinGecko...");
  let tokens = [];

  // Pull top 500 (5×100)
  for (let page = 1; page <= 5; page++) {
    const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page
      }
    });
    tokens = tokens.concat(res.data || []);
  }

  report.lines.push(`✅ Fetched ${tokens.length} tokens.`);

  const sanitizedNames = tokens.map((t) => sanitize(t.name));
  const sanitizedSymbols = tokens.map((t) => sanitize(t.symbol));

  const BATCH_SIZE = 100;
  let batchesSent = 0;
  let totalNamesConsidered = 0;
  let totalPairsBanned = 0;

  for (let i = 0; i < sanitizedNames.length; i += BATCH_SIZE) {
    const batchNames = sanitizedNames.slice(i, i + BATCH_SIZE);
    const batchSymbols = sanitizedSymbols.slice(i, i + BATCH_SIZE);

    const filteredNames = [];
    const filteredSymbols = [];

    for (let j = 0; j < batchNames.length; j++) {
      const name = batchNames[j];
      const symbol = batchSymbols[j];

      // ✅ Skip empty/oversized inputs (contract enforces stricter limits anyway)
      if (!name || !symbol) continue;
      if (name.length > 64 || symbol.length > 16) continue;

      // ✅ Skip if already globally banned
      // NOTE: this call must match your on-chain method signature
      const alreadyBanned = await Registry.isGloballyBanned(name, symbol);
      if (!alreadyBanned) {
        filteredNames.push(name);
        filteredSymbols.push(symbol);
      }
    }

    totalNamesConsidered += batchNames.length;

    if (filteredNames.length === 0) {
      const msg = `⎩ Batch ${i / BATCH_SIZE + 1} skipped (all already banned or invalid).`;
      console.log(msg);
      report.lines.push(msg);
      continue;
    }

    const range = `${i} to ${i + filteredNames.length - 1}`;
    const txMsg = `📦 Sending batch ${i / BATCH_SIZE + 1}: ${range}`;
    console.log(txMsg);
    report.lines.push(txMsg);

    // 🔍 Optional: print members of this batch for audit
    for (let j = 0; j < filteredNames.length; j++) {
      console.log(`   • ${filteredNames[j]} / ${filteredSymbols[j]}`);
    }

    try {
      // ⚠️ gasLimit is a guard; tune per your chain behavior
      const tx = await Registry.batchBanTokens(filteredNames, filteredSymbols, {
        gasLimit: 2_500_000
      });

      // Print + store hash immediately
      const hashLine = `🔗 TX submitted: ${tx.hash}`;
      console.log(hashLine);
      report.lines.push(hashLine);
      report.txHashes.push(tx.hash);

      const receipt = await tx.wait();
      const doneMsg = `✅ Batch ${i / BATCH_SIZE + 1} confirmed in block ${receipt.blockNumber}.`;
      console.log(doneMsg);
      report.lines.push(doneMsg);

      batchesSent += 1;
      totalPairsBanned += filteredNames.length;
    } catch (err) {
      const failMsg = `💥 Failed batch ${i / BATCH_SIZE + 1}: ${err.reason || err.message}`;
      console.error(failMsg);
      report.lines.push(failMsg);
      report.success = false;
      // Stop after first failure to avoid cascading issues
      break;
    }

    // ⏱️ Respectful delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // 📌 Summary/output for UX
  if (batchesSent === 0) {
    report.output = "No transactions sent — global ban list already up to date.";
    report.lines.push("🛈 No-op: all candidates were already banned or invalid.");
    // Keep previous tx hash list so the UI can still display *something*
    if (KEEP_OLD_HASHES_IF_NO_TX && prev && Array.isArray(prev.txHashes) && prev.txHashes.length > 0) {
      report.txHashes = prev.txHashes.slice(-10); // keep last 10 for UX
      report.lines.push("↻ Retained previous tx hashes for display (no new TX this run).");
    }
  } else {
    report.output = `Godzilla ban update complete: ${batchesSent} batch(es) sent, ${totalPairsBanned} pair(s) banned, ${totalNamesConsidered} checked.`;
  }

  report.lines.push("🛡️ Godzilla ban list update complete.");

  // ✂️ Trim and persist
  const MAX_LINES = 50;
  report.ranAt = Date.now(); // final timestamp
  report.lines = report.lines.slice(-MAX_LINES);

  fs.writeFileSync(DATA_PATH, JSON.stringify(report, null, 2), "utf-8");
  console.log("📃 Saved report to godzilla-ban.json.");
}

main().catch((err) => {
  console.error("💥 Script failed:", err.message);
  process.exit(1);
});














