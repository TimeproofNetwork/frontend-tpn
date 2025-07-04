// scripts/simulateDAOBan.js

const { ethers } = require("hardhat");

async function main() {
  const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
  const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
  const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";
  // ✅ Final TokenRegistry

  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);
  const [dao] = await ethers.getSigners();

  console.log("🔐 Connected as DAO:", dao.address);

  const TOKENS = [
    { name: "bytefoundry", symbol: "byt" },
    { name: "neuronspace", symbol: "nsp" },
    { name: "fahamaynoor", symbol: "fmr" },
    { name: "bilkisnaaz", symbol: "bkz" }
  ];

  for (const token of TOKENS) {
    try {
      // ⛔ Step: DAO Ban (no sanitization)
      console.log(`⛔ Attempting DAO ban: ${token.name}`);
      const tx = await Registry.daoBan(token.name, token.symbol, true);
      await tx.wait();
      console.log(`✅ DAO ban successful for ${token.name}`);
    } catch (err) {
      const reason = err?.error?.message || err?.reason || err.message || "Unknown error";
      console.log(`❌ DAO ban failed for ${token.name}: ${reason}`);
    }
  }
}

main().catch((error) => {
  console.error("❌ Script crashed:", error);
  process.exit(1);
});











































































