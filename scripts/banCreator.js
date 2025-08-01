const { ethers } = require("hardhat");

const REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6"; // ✅ Your deployed TokenRegistry
const CREATOR = "0x53ff31D7A97a1A06DfdCC36488569d9C9dD4916f"; // 🔨 Creator to be banned

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`🔐 Using deployer: ${deployer.address}`);

  const registry = await ethers.getContractAt("TokenRegistry", REGISTRY);

  const tx = await registry.banCreator(CREATOR);

  await tx.wait();

  console.log(`🚫 Successfully banned creator: ${CREATOR}`);

  const isBanned = await registry.daoBannedCreators(CREATOR);
  console.log(`📍 Ban status confirmed: ${isBanned ? "BANNED" : "NOT BANNED"}`);
}

main().catch((err) => {
  console.error("❌ Error banning creator:", err);
  process.exit(1);
});
