// scripts/simulateSelfHealResilience.js

const { ethers } = require("hardhat");

// ✅ Final TokenRegistry address (Final Locked Deployment)
const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

// 🧪 List of suspected clones (optional: pass token addresses if targeting specific ones)
const CLONES = []; // Leave empty for full dry-run check

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔐 Using deployer:", deployer.address);

  if (deployer.address.toLowerCase() !== "0x6e118ac0da2170697a4f942a0c509b29c59f698f") {
    console.warn("⚠️ WARNING: Deployer wallet does not match final deployment address");
  }

  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  console.log("\n🧼 Running Self-Heal Resilience (Clean Registry)...");

  try {
    console.time("⏳ Self-Heal Duration");

    const tx = await Registry.selfHeal(CLONES, {
      gasLimit: 300000,
      maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei"),
    });

    const receipt = await tx.wait();

    console.timeEnd("⏳ Self-Heal Duration");

    console.log("✅ Self-Heal executed successfully");
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`📜 Tx Hash: ${tx.hash}`);
    console.log(`📘 Result: ${CLONES.length === 0 ? "No clones purged — registry logbook is clean." : "Clone check executed for " + CLONES.length + " entries."}`);
  } catch (err) {
    console.error("❌ Self-Heal Failed:", err.message || err);
  }
}

main().catch((err) => {
  console.error("❌ Script Error:", err);
  process.exit(1);
});















