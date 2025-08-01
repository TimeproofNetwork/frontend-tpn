// scripts/simulateSelfHealResilience.js

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const registryABI = require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;

// ✅ Final Contract Addresses
const TPN_TOKEN = "0xA7e3976928332e90DE144f6d4c6393B64E37bf6C";
const BADGE_NFT = "0x49A5f62fEb8ADd7323cc14a205a60608378c1D75";
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🧪 Simulated input clones (empty for clean test)
const CLONES = [];

async function main() {
  try {
    const signers = await ethers.getSigners();
    const [deployer] = signers;

    const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

    const lines = [];
    const now = Date.now();

    lines.push(`🔐 Using deployer: ${deployer.address}`);
    lines.push("");
    lines.push("🧼 Running Self–Heal Resilience (Clean Registry)...");

    console.time("⏳ Self–Heal Duration");
    const start = Date.now();

    // ✅ Simpler, safer transaction
    const tx = await Registry.selfHeal(CLONES);
    const receipt = await tx.wait();

    const duration = ((Date.now() - start) / 1000).toFixed(3);
    console.timeEnd("⏳ Self–Heal Duration");

lines.push(`✅ Self–Heal executed successfully`);
lines.push(`⏳ Duration: ${duration}s`); // ← 👈 Insert this line
lines.push(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
lines.push(`📜 Tx Hash: ${tx.hash}`);

    lines.push(
      `📘 Result: ${
        CLONES.length === 0
          ? "No clones purged — registry logbook is clean."
          : "Clone check executed for " + CLONES.length + " entries."
      }`
    );

    // 📤 Output to console
    console.log(lines.join("\n"));

    // 📝 Save to self-heal-report.json
    const jsonPath = path.join(__dirname, "..", "frontend-tpn", "data", "self-heal-report.json");
    fs.writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      ranAt: now,
      duration: `${duration}s`,
      ok: true,
      lines,
    },
    null,
    2
  )
);
    console.log(`📝 Saved output to self-heal-report.json (${lines.length} lines)`);

  } catch (err) {
    console.error("❌ Self-Heal Failed:", err.message || err);
    process.exit(1);
  }
}

main();



















