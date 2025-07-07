// scripts/viewDAOBanStatus.js

const { ethers } = require("hardhat");

// ✅ Final TokenRegistry Address (June 23)
const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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


