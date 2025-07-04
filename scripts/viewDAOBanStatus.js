// scripts/viewDAOBanStatus.js

const { ethers } = require("hardhat");

// ✅ Final TokenRegistry Address (June 23)
const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

async function main() {
  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

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
      break;
    }
  }

  console.log(`\n📊 Total DAO-Banned Tokens Found: ${tokens.length}`);
}

main().catch((error) => {
  console.error("❌ DAO Ban Status Check Failed:", error);
  process.exit(1);
});


