// scripts/simulateDAOBan.js

const { ethers } = require("hardhat");
const registryABI = require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;
const { sanitizeInput } = require("./sanitizeInputs");

const registryAddress = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🛑 Tokens to ban
const tokensToBan = [
  { name: "SOLANAXPRESS", symbol: "slx" },
  { name: "MAPLERESERVE", symbol: "mpr" }
];

async function main() {
  const [dao] = await ethers.getSigners();
  console.log(`🔐 Connected as DAO: ${dao.address}`);

  const Registry = await ethers.getContractAt("TokenRegistry", registryAddress, dao);

  for (const token of tokensToBan) {
    console.log(`────────────────────────────────────────────`);
    console.log(`⛔ Attempting DAO Ban for: ${token.name} (${token.symbol})`);

    const nameSanitized = sanitizeInput(token.name);
    const symbolSanitized = sanitizeInput(token.symbol);

    console.log(`🔤 Sanitized Name: ${nameSanitized}`);
    console.log(`🔤 Sanitized Symbol: ${symbolSanitized}`);

    try {
      const tx = await Registry.daoBan(nameSanitized, symbolSanitized, true);
      await tx.wait();
      console.log(`✅ DAO Ban successful for ${token.name} (${token.symbol})`);
    } catch (err) {
      const reason =
        err?.error?.message || err?.reason || err?.data?.message || err.message || "Unknown error";
      console.log(`❌ DAO Ban failed for ${token.name}: ${reason}`);
    }
  }

  console.log(`🏁 DAO Ban script completed.`);
}

main().catch((error) => {
  console.error("❌ Script crashed:", error);
  process.exit(1);
});












































































