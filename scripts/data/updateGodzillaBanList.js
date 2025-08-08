// scripts/data/updateGodzillaBanList.js

const axios = require("axios");
const { ethers } = require("ethers");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ✅ Load .env
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

if (!process.env.ADMIN_PRIVATE_KEY) throw new Error("❌ ADMIN_PRIVATE_KEY missing");
if (!process.env.SEPOLIA_RPC_URL) throw new Error("❌ SEPOLIA_RPC_URL missing");
if (!process.env.NEXT_PUBLIC_TOKEN_REGISTRY) throw new Error("❌ NEXT_PUBLIC_TOKEN_REGISTRY missing");
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("❌ Supabase env vars missing");

const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const TOKEN_REGISTRY = process.env.NEXT_PUBLIC_TOKEN_REGISTRY;

// ✅ Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 🧼 Sanitizer
function sanitize(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function main() {
  const TokenRegistryAbi = require("../../frontend-tpn/abi/TokenRegistry.json").abi;
  const Registry = new ethers.Contract(TOKEN_REGISTRY, TokenRegistryAbi, wallet);

  const report = {
    ranAt: new Date().toISOString(),
    lines: [],
    output: "",
    success: true,
    txHashes: [],
  };

  report.lines.push("🔒 Starting Godzilla Ban Update...");
  report.lines.push(`🧾 Registry Address: ${TOKEN_REGISTRY}`);
  report.lines.push(`🚀 Caller: ${wallet.address}`);

  console.log("🌐 Fetching top 500 tokens...");
  let tokens = [];

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

  const BATCH_SIZE = 100;
  let totalPairsBanned = 0;
  let batchesSent = 0;

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);

    const filteredNames = [];
    const filteredSymbols = [];

    for (let j = 0; j < batch.length; j++) {
      const token = batch[j];
      const rawName = token.name;
      const rawSymbol = token.symbol;

      const sanitizedName = sanitize(rawName);
      const sanitizedSymbol = sanitize(rawSymbol);

      // ❗Skip if sanitization alters input (unsafe fingerprint)
      if (sanitizedName !== sanitize(sanitizedName) || sanitizedSymbol !== sanitize(sanitizedSymbol)) {
        const msg = `⎩ Skipped due to sanitize mismatch: (${rawName}, ${rawSymbol})`;
        report.lines.push(msg);
        console.log(msg);
        continue;
      }

      if (!sanitizedName || !sanitizedSymbol || sanitizedName.length > 64 || sanitizedSymbol.length > 16) continue;

      const banned = await Registry.isGloballyBanned(sanitizedName, sanitizedSymbol);
      if (!banned) {
        filteredNames.push(sanitizedName);
        filteredSymbols.push(sanitizedSymbol);
      }
    }

    if (filteredNames.length === 0) {
      const skipMsg = `⎩ Batch ${i / BATCH_SIZE + 1} skipped (all banned/invalid).`;
      console.log(skipMsg);
      report.lines.push(skipMsg);
      continue;
    }

    const txMsg = `📦 Sending batch ${i / BATCH_SIZE + 1}: ${i}–${i + filteredNames.length - 1}`;
    report.lines.push(txMsg);
    console.log(txMsg);

    try {
      const tx = await Registry.batchBanTokens(filteredNames, filteredSymbols, { gasLimit: 2_500_000 });
      report.lines.push(`🔗 TX submitted: ${tx.hash}`);
      report.txHashes.push(tx.hash);

      const receipt = await tx.wait();
      const confirmMsg = `✅ Batch ${i / BATCH_SIZE + 1} confirmed in block ${receipt.blockNumber}`;
      report.lines.push(confirmMsg);
      console.log(confirmMsg);

      batchesSent++;
      totalPairsBanned += filteredNames.length;
    } catch (err) {
      const failMsg = `💥 Failed batch ${i / BATCH_SIZE + 1}: ${err.reason || err.message}`;
      report.lines.push(failMsg);
      console.error(failMsg);
      report.success = false;
      break;
    }

    await new Promise(res => setTimeout(res, 3000));
  }

  // Final summary
  report.output = batchesSent === 0
    ? "No transactions sent — global ban list already up to date."
    : `Godzilla ban update complete: ${batchesSent} batch(es), ${totalPairsBanned} pair(s) banned.`;

  report.lines.push("🛡️ Godzilla ban list update complete.");
  report.lines = report.lines.slice(-50); // Trim

  // ✅ Push to Supabase
  const { error } = await supabase.from("godzilla_ban_logs").insert([{
    ran_at: report.ranAt,
    tx_hashes: report.txHashes,
    output: report.output,
    success: report.success,
    lines: report.lines
  }]);

  if (error) {
    console.error("❌ Supabase insert failed:", error.message);
  } else {
    console.log("✅ Report saved to Supabase godzilla_ban_logs");
  }
}

main().catch(err => {
  console.error("💥 Script failed:", err.message);
  process.exit(1);
});



















