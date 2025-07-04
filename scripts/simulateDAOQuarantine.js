const { ethers } = require("hardhat");
const { sanitizeInput } = require("./sanitizeInputs");

  async function main() {
   const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
   const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
   const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";
  // ✅ Final TokenRegistry
  
  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  const [dao] = await ethers.getSigners();
  console.log("🔐 Connected as DAO:", dao.address);

  const TOKENS = [
    { name: "foundrycore", symbol: "fcr" },
    { name: "zenmodule", symbol: "zmd" },
    { name: "mekbekhues", symbol: "mks" },
    { name: "rotgenkrup", symbol: "rkp" }
  ];

  for (const token of TOKENS) {
    try {
      const cleanName = sanitizeInput(token.name);
      const cleanSymbol = sanitizeInput(token.symbol);

      console.log(`🚨 Quarantining: ${token.name} (${token.symbol})`);
      const tx = await Registry.daoQuarantine(cleanName, cleanSymbol, {
        gasLimit: 300000,
        maxPriorityFeePerGas: ethers.utils.parseUnits("3", "gwei"),
        maxFeePerGas: ethers.utils.parseUnits("50", "gwei")
      });
      await tx.wait();
      console.log(`✅ Quarantined: ${token.name}`);
    } catch (err) {
      const reason = err?.error?.message || err.message || "Unknown error";
      console.log(`❌ Quarantine failed for ${token.name}: ${reason}`);
    }
  }
}

main().catch((error) => {
  console.error("❌ Script Failed:", error);
  process.exit(1);
});





















