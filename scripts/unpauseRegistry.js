// scripts/unpauseRegistry.js

const { ethers } = require("hardhat");

// ✅ Final TokenRegistry address
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔐 Using deployer:", deployer.address);

  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY, deployer);

  const tx = await Registry.unpauseRegistry();
  await tx.wait();

  console.log("▶️ Registry unpaused successfully.");
  console.log(`📜 Tx Hash: ${tx.hash}`);
}

main().catch((err) => {
  console.error("❌ Script Error:", err);
  process.exit(1);
});

