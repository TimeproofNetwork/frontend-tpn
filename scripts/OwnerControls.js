const { ethers } = require("hardhat");

async function main() {
  const registryAddress = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";
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
