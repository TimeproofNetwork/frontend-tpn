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
    {
      name: "orbitnectar",
      symbol: "orn",
      tokenAddress: "0xEee0c8C8a9d697058Aa95a2d0b116382cC7e0D42",
      newLevel: 1
    },
    {
      name: "polopmolop",
      symbol: "plp",
      tokenAddress: "0x21fF9eDA09cf368c9dC9812E8bed91114fd2918B",
      newLevel: 1
    },
    {
      name: "dextydeme",
      symbol: "dme",
      tokenAddress: "0xa709b30Dc5718881CC47faAeb9F030070165e2f8",
      newLevel: 1
    }
  ];

  for (const token of TOKENS) {
    try {
      const checksumAddress = ethers.utils.getAddress(token.tokenAddress.toLowerCase());

      console.log(`🌀 Attempting upgrade to same trust level: ${token.name} → Level ${token.newLevel}`);
      const tx = await Registry.daoUpgradeTrustLevel(
        checksumAddress,
        token.newLevel,
        "", // proof1
        ""  // proof2
      );
      await tx.wait();
      console.log(`✅ DAO upgrade (same level) successful for ${token.name}`);
    } catch (err) {
      const reason = err?.error?.message || err.message || "Unknown error";
      console.log(`❌ Upgrade failed for ${token.name}: ${reason}`);
    }
  }
}

main().catch((error) => {
  console.error("❌ Script Failed:", error);
  process.exit(1);
});















