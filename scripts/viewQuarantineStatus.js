// scripts/scanQuarantineStatus.js
const { ethers } = require("hardhat");

// ✅ Final Deployed TokenRegistry Address
const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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





