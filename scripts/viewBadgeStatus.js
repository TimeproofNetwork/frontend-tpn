const { ethers } = require("hardhat");
const registryABI = require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;

// ✅ Final TokenRegistry Deployment Address
const TPN_TOKEN = "0xA7e3976928332e90DE144f6d4c6393B64E37bf6C";
const BADGE_NFT = "0x49A5f62fEb8ADd7323cc14a205a60608378c1D75";
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

async function main() {
  const registry = new ethers.Contract(TOKEN_REGISTRY, registryABI, (await ethers.getSigners())[0]);

  console.log("\n🔍 Checking all Level 1 (Basic Trust) badges...\n");

  const level1 = [];

  let index = 0;
  while (true) {
    try {
      const token = await registry.tokenLogbook(index);
      const tokenAddress = token.tokenAddress;
      const [name, symbol, , , , , , trustLevel] = await registry.getTokenInfo(tokenAddress);

      if (trustLevel === 1) {
        level1.push({ name, symbol, trustLevel, tokenAddress });
      }

      index++;
    } catch (err) {
      break; // End of logbook
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










