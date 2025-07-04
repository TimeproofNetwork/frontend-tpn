const { ethers } = require("hardhat");

// ✅ Final TokenRegistry Deployment Address
const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

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









