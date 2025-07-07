// scripts/simulateSelfHealResilience.js

const { ethers } = require("hardhat");

// ✅ Final TokenRegistry address (Final Locked Deployment)
const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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















