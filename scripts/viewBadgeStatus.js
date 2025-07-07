const { ethers } = require("hardhat");

// ✅ Final TokenRegistry Deployment Address
const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

async function main() {
  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  console.log("\n🔍 Checking all Level 1 (Basic Trust) badges...\n");

  const level1 = [];

  let index = 0;
  while (true) {
    try {
      const tokenAddress = await registry.allRegisteredTokens(index);
      const [name, symbol, , , , trustLevel] = await registry.getTokenInfo(tokenAddress);

      if (trustLevel === 1) {
        level1.push({ name, symbol, trustLevel, tokenAddress });
      }

      index++;
    } catch (err) {
      break; // End of token logbook
    }
  }

  if (level1.length === 0) {
    console.log("⚠️ No Level 1 tokens found.");
  } else {
    console.log(`📊 Total Level 1 Badges: ${level1.length}\n`);
    for (const token of level1) {
      console.log(`✅ ${token.name} (${token.symbol}) | Trust Level: ${token.trustLevel} | ${token.tokenAddress}`);
    }
  }
}

main().catch((err) => {
  console.error("❌ Script Failed:", err);
});









