// scripts/viewRegistryStatus.js

const { ethers } = require("hardhat");
const registryABI = require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;

const TOKEN_REGISTRY = process.env.TOKEN_REGISTRY || "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = new ethers.Contract(TOKEN_REGISTRY, registryABI, deployer);

  console.log("🔎 Checking last 35 tokens from registry logbook...\n");

  const tokenList = await registry.getTokenLogbook();
  console.log("📦 Total registered tokens:", tokenList.length);

  const total = tokenList.length;
  const start = Math.max(0, total - 35);

  for (let i = start; i < total; i++) {
    try {
      const tokenAddress = tokenList[i].tokenAddress || tokenList[i];

      const [
        name,
        symbol,
        addr,
        creator,
        timestamp,
        proof1,
        proof2,
        trustLevel,
        isRegistered,
        upgradeRequested
      ] = await registry.getTokenInfo(tokenAddress);

      const date = new Date(timestamp.toNumber() * 1000).toISOString();

      // Additional flags via separate view calls
      const isQuarantined = await registry.isQuarantined(name, symbol);
      const isDaoBanned = await registry.isDAOPunished(name, symbol);

      console.log(`✅ ${name.toUpperCase()} (${symbol})`);
      console.log(`   → Address:     ${addr}`);
      console.log(`   → Creator:     ${creator}`);
      console.log(`   → Registered:  ${date}`);
      console.log(`   → Badge Level: ${trustLevel}`);
      if (proof1) console.log(`   → Proof 1:     ${proof1}`);
      if (proof2) console.log(`   → Proof 2:     ${proof2}`);
      if (upgradeRequested) console.log(`   → 🔄 Upgrade Requested`);
      if (isQuarantined) console.log(`   → 🔒 Quarantined`);
      if (isDaoBanned) console.log(`   → 🚫 DAO Banned`);
      console.log("--------------------------------------------------");

    } catch (err) {
      console.error(`❌ Could not fetch details for token ${i}:`, err.reason || err.message);
    }
  }
}

main().catch((error) => {
  console.error("❌ Unhandled error:", error.message);
});























