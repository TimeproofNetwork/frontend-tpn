// scripts/pauseRegistry.js

const { ethers } = require("hardhat");

// ✅ FINAL LOCKED ADDRESS — TokenRegistry.sol
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔐 Using deployer:", deployer.address);

  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY, deployer);

  const tx = await registry.pauseRegistry();
  await tx.wait();

  console.log("⏸️ Registry paused successfully.");
  console.log(`📜 Tx Hash: ${tx.hash}`);
  console.log("📣 Message: ⏸️ Registry under audit simulation. Resuming in 9 minutes.");
}

main().catch((err) => {
  console.error("❌ Script Error:", err);
  process.exit(1);
});


