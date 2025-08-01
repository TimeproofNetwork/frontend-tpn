const { ethers } = require("hardhat");

async function main() {
  const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";
  const registry = await ethers.getContractAt("TokenRegistry", registryAddress);

  // 1. Update minimum fee
  const newFee = ethers.utils.parseUnits("150", 18); // e.g., 150 TPN
  await (await registry.updateMinFee(newFee)).wait();
  console.log("✅ Minimum registration fee updated.");

  // 2. Transfer ownership (to new DAO wallet or another admin)
  const newOwner = "0xNEWOWNERADDRESS_HERE";
  await (await registry.transferOwnership(newOwner)).wait();
  console.log(`✅ Ownership transferred to: ${newOwner}`);
}

main().catch((error) => {
  console.error("❌ Admin script failed:", error);
  process.exit(1);
});
