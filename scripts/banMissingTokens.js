const { ethers } = require("hardhat");
const { sanitizeName, sanitizeSymbol } = require("./sanitizeInputs");
const top500 = require("./data/top500Tokens"); // Exports an array

const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52"; // Update if needed

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("TokenRegistry", REGISTRY);

  console.log(`🔐 Using deployer: ${deployer.address}`);
  console.log(`🧩 Checking tokens to ban...`);

  let total = 0, skipped = 0, failed = 0;

  for (const token of top500) {
    const name = sanitizeName(token.name);
    const symbol = sanitizeSymbol(token.symbol);

    try {
      const banned = await registry.isGloballyBanned(name, symbol);
      if (banned) {
        skipped++;
        continue;
      }

      console.log(`🔍 Attempting ban: ${name} (${symbol})`);
      const tx = await registry.banTokenGlobally(name, symbol);
      await tx.wait(1);
      total++;
    } catch (err) {
      console.log(`⚠️ Failed: ${name} (${symbol})`);
      console.log(`   Reason: ${err.reason || err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Ban Process Complete — New: ${total}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch((error) => {
  console.error("❌ Script Error:", error);
});

