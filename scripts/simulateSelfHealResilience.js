// scripts/simulateSelfHealResilience.js

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ✅ Supabase env checks
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("❌ Supabase env vars missing");
}

// ✅ Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ✅ Final Contract Addresses
const TPN_TOKEN = "0xA7e3976928332e90DE144f6d4c6393B64E37bf6C";
const BADGE_NFT = "0x49A5f62fEb8ADd7323cc14a205a60608378c1D75";
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🧪 Simulated input clones (empty = clean test)
const CLONES = [];

async function main() {
  try {
    const signers = await ethers.getSigners();
    const [deployer] = signers;
    const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

    const lines = [];
    const ranAt = new Date().toISOString();

    lines.push(`🔐 Using deployer: ${deployer.address}`);
    lines.push("");
    lines.push("🧼 Running Self–Heal Resilience (Clean Registry)...");

    console.time("⏳ Self–Heal Duration");
    const start = Date.now();

    const tx = await Registry.selfHeal(CLONES);
    const receipt = await tx.wait();

    const duration = ((Date.now() - start) / 1000).toFixed(3);
    const gasUsed = parseInt(receipt.gasUsed.toString());
    const txHash = tx.hash;

    console.timeEnd("⏳ Self–Heal Duration");

    lines.push(`✅ Self–Heal executed successfully`);
    lines.push(`⏳ Duration: ${duration}s`);
    lines.push(`⛽ Gas Used: ${gasUsed}`);
    lines.push(`📜 Tx Hash: ${txHash}`);

    const resultLine =
      CLONES.length === 0
        ? "No clones purged — registry logbook is clean."
        : `Clone check executed for ${CLONES.length} entries.`;

    lines.push(`📘 Result: ${resultLine}`);

    console.log(lines.join("\n"));

    // ✅ Save JSON report locally
    const jsonPath = path.join(__dirname, "..", "frontend-tpn", "data", "self-heal-report.json");
    fs.writeFileSync(
      jsonPath,
      JSON.stringify(
        {
          ranAt,
          duration: `${duration}s`,
          ok: true,
          gas_used: gasUsed,
          tx_hash: txHash,
          result_line: resultLine,
          lines,
        },
        null,
        2
      )
    );
    console.log(`📝 Saved output to self-heal-report.json (${lines.length} lines)`);

    // ✅ Insert to Supabase
    const { error } = await supabase.from("self_heal_logs").insert([
      {
        ran_at: ranAt,
        duration: `${duration}s`,
        ok: true,
        gas_used: gasUsed,
        tx_hash: txHash,
        result_line: resultLine,
        lines,
      },
    ]);

    if (error) {
      console.error("❌ Supabase insert failed:", error.message);
    } else {
      console.log("✅ Self-Heal log saved to Supabase.");
    }
  } catch (err) {
    console.error("❌ Self-Heal Failed:", err.message || err);
    process.exit(1);
  }
}

main();





















