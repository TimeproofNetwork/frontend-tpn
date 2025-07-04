// scripts/scanQuarantineStatus.js
const { ethers } = require("hardhat");

// ✅ Final Deployed TokenRegistry Address
const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

// 🎯 Token list — both registered & unregistered
const TOKENS = [
  { name: "foundrycore", symbol: "fcr" },
  { name: "zenmodule", symbol: "zmd" },
  { name: "mekbekhues", symbol: "mks" },
  { name: "rotgenkrup", symbol: "rkp" },
];

async function main() {
  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  for (const token of TOKENS) {
    try {
      const isQuarantined = await registry.isQuarantined(token.name, token.symbol);
      if (isQuarantined) {
        console.log(`🚨 Quarantined: ${token.name} (${token.symbol})`);
      } else {
        console.log(`✅ Not Quarantined: ${token.name} (${token.symbol})`);
      }
    } catch (err) {
      console.error(`❌ Error checking ${token.name}:`, err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});





