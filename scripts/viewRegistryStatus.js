// scripts/viewRegistryStatus.js

const { ethers } = require("hardhat");

// ✅ Final deployed TokenRegistry address
const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

async function main() {
  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);
  console.log("🔎 Checking last 20 tokens from registry logbook...\n");

  const allTokens = [];
  let index = 0;

  while (true) {
    try {
      const token = await registry.tokenLogbook(index);
      allTokens.push(token.tokenAddress);
      index++;
    } catch (err) {
      break; // reached end
    }
  }

  const total = allTokens.length;
  const start = Math.max(0, total - 20);

  for (let i = start; i < total; i++) {
    try {
      const tokenAddress = allTokens[i];
      const [name, symbol, addr, creator, timestamp, trustLevel] = await registry.getTokenInfo(tokenAddress);

      const date = new Date(timestamp.toNumber() * 1000).toISOString();
      console.log(`✅ ${name.toUpperCase()} (${symbol})`);
      console.log(`   → Address:     ${addr}`);
      console.log(`   → Creator:     ${creator}`);
      console.log(`   → Registered:  ${date}`);
      console.log(`   → Trust Level: ${trustLevel}`);
      console.log("--------------------------------------------------");
    } catch (err) {
      console.log(`❌ Could not fetch details for token ${i}:`, err.message);
    }
  }
}

main().catch((error) => {
  console.error("❌ Registry check failed:", error);
  process.exit(1);
});









