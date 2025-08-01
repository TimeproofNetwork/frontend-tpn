// scripts/simulateDAOUpgradeAndDowngrade.js

const { ethers } = require("hardhat");
const { sanitizeInput } = require("./sanitizeInputs.js");
const registryABI = require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;

// ✅ Final deployed TokenRegistry address
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// ✅ Tokens to upgrade
const TOKENS = [
  {
    name: "AlmondCentral",
    symbol: "almc",
    tokenAddress: "0x3904A8e35F1fb72f65ca44aB7e79662a5ec20245",
    newLevel: 3,
    proof1: "https://www.coinbase.com/en-in/price/almondcentral",
    proof2: "https://www.certik.com/projects/almondcentral",
  },
  {
    name: "A1mondCentral",
    symbol: "almc",
    tokenAddress: "0x63efEB07b423c1f7e1A9Cba7c109F274DD9bca91",
    newLevel: 2,
    proof1: "https://www.coinbase.com/en-in/price/a1mondcentral",
    proof2: "", // Level 2 doesn't need proof2
  },
];

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`🔐 Using wallet: ${signer.address}`);

  const Registry = new ethers.Contract(TOKEN_REGISTRY, registryABI, signer);

  // ✅ Print selector hash for debugging
  console.log("🎯 Function selector:", ethers.utils.id("daoUpgradeTrustLevel(address,uint8,string memory,string memory)").slice(0, 10));

  for (const token of TOKENS) {
    try {
      const nameSanitized = sanitizeInput(token.name);
      const symbolSanitized = sanitizeInput(token.symbol);
      const checksumAddress = ethers.utils.getAddress(token.tokenAddress.toLowerCase());

      console.log(`\n🌀 Upgrading ${nameSanitized} (${symbolSanitized}) → Level ${token.newLevel}`);
      console.log(`🔗 Proof1: ${token.proof1}`);
      console.log(`🔗 Proof2: ${token.proof2 || "N/A"}`);

      const tx = await Registry.daoUpgradeTrustLevel(
        checksumAddress,
        token.newLevel,
        token.proof1,
        token.proof2
      );
      await tx.wait();

      console.log(`✅ DAO upgrade successful for ${nameSanitized} → Level ${token.newLevel}`);
    } catch (err) {
      const reason = err?.reason || err?.error?.message || err.message || "Unknown error";
      console.log(`❌ Upgrade failed for ${token.name}: ${reason}`);
    }
  }

  console.log(`\n🏁 DAO Upgrade script completed.`);
}

main().catch((error) => {
  console.error("❌ Script Failed:", error);
  process.exit(1);
});






















