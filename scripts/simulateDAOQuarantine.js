const { ethers } = require("hardhat");
const { sanitizeInput } = require("./sanitizeInputs");

  async function main() {
   const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
   const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
   const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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





















