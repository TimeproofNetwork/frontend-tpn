// scripts/viewDAOBanStatus.js
const { ethers } = require("hardhat");
const registryABI = require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;

// ✅ Final TokenRegistry Address
const TPN_TOKEN = "0xA7e3976928332e90DE144f6d4c6393B64E37bf6C";
const BADGE_NFT = "0x49A5f62fEb8ADd7323cc14a205a60608378c1D75";
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = new ethers.Contract(TOKEN_REGISTRY, registryABI, deployer);

  console.log("\n🔍 Checking all DAO-banned tokens...\n");

  const tokens = [];
  const MAX = 1000;

  for (let i = 0; i < MAX; i++) {
    try {
      const token = await registry.tokenLogbook(i);
      const isBanned = await registry.isDAOPunished(token.name, token.symbol);

      if (isBanned) {
        console.log(`❌ DAO-Banned: ${token.name.toUpperCase()} (${token.symbol})`);
        console.log(`   → Address:     ${token.tokenAddress}`);
        console.log(`   → Creator:     ${token.registeredBy}`);
        console.log(`   → Registered:  ${new Date(token.timestamp.toNumber() * 1000).toISOString()}`);
        console.log(`   → Log Index:   ${i}`);
        console.log("--------------------------------------------------");
        tokens.push(token);
      }
    } catch {
      break; // Reached end of logbook
    }
  }

  console.log(`\n📊 Total DAO-Banned Tokens Found: ${tokens.length}`);
}

main().catch((error) => {
  console.error("❌ DAO Ban Status Check Failed:", error);
  process.exit(1);
});



