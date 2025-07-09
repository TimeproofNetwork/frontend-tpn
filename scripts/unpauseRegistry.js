// scripts/unpauseRegistry.js

const { ethers } = require("hardhat");

// ✅ Final TokenRegistry address
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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
