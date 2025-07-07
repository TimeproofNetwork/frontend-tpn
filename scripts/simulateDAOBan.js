// scripts/simulateDAOBan.js

const { ethers } = require("hardhat");

async function main() {
  const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
  const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
  const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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











































































