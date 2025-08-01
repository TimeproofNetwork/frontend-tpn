// scripts/simulateDAOUnQuarantine.js

const { ethers } = require("hardhat");
const registryABI = require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;
const { sanitizeInput } = require("./sanitizeInputs");

// ✅ Final deployed TokenRegistry address (Sepolia)
const registryAddress = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🧪 Tokens to unquarantine
const tokensToUnquarantine = [
  { name: "A1MONDCENTRAL", symbol: "almc" },
  { name: "ORBITVERSE", symbol: "ovr" }
];

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`🔐 Using wallet: ${signer.address}`);

  const Registry = new ethers.Contract(registryAddress, registryABI, signer);

  for (const token of tokensToUnquarantine) {
    console.log(`────────────────────────────────────────────`);
    console.log(`🔓 Attempting Unquarantine for: ${token.name} (${token.symbol})`);

    const nameSanitized = sanitizeInput(token.name);
    const symbolSanitized = sanitizeInput(token.symbol);

    console.log(`🔤 Sanitized Name: ${nameSanitized}`);
    console.log(`🔤 Sanitized Symbol: ${symbolSanitized}`);
    console.log(`🔍 Calling: unquarantineToken(name, symbol)`);

    try {
      const tx = await Registry.unquarantineToken(nameSanitized, symbolSanitized);
      await tx.wait();

      console.log(`✅ Unquarantined: ${token.name} (${token.symbol})`);
    } catch (err) {
      console.error(`❌ Unquarantine failed for ${token.name}: ${err.reason || err.message}`);
    }
  }

  console.log(`🏁 Unquarantine script completed.`);
}

main().catch((error) => {
  console.error("❌ Script Failed:", error);
  process.exit(1);
});

