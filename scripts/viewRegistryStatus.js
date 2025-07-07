// scripts/viewRegistryStatus.js

const { ethers } = require("hardhat");

// ✅ Final deployed TokenRegistry address
const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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









