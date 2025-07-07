// /scripts/deploy.js

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔐 Using deployer:", deployer.address);

  // ============================================================================
  // 📦 Deploy TPNToken
  // ============================================================================
  const TPNToken = await ethers.getContractFactory("TPNToken");
  const tpnToken = await TPNToken.deploy(
    "Timeproof Network",                      // name_
    "TPN",                                     // symbol_
    18,                                        // decimals_
    ethers.utils.parseEther("1000000000"),     // 1 Billion TPN
    deployer.address                           // owner_ (DAO post-launch)
  );
  await tpnToken.deployed();
  console.log("✅ TPNToken deployed to:", tpnToken.address);

  // ============================================================================
  // 🏅 Deploy BadgeNFT
  // ============================================================================
  const BadgeNFT = await ethers.getContractFactory("BadgeNFT");
  const badgeNFT = await BadgeNFT.deploy(
    "TPN Badge",         // name
    "TPNB",              // symbol
    deployer.address     // _customOwner
  );
  await badgeNFT.deployed();
  console.log("🏅 BadgeNFT deployed to:", badgeNFT.address);

  // ============================================================================
  // 🧱 Deploy TokenRegistry
  // ============================================================================
  const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
  const tokenRegistry = await TokenRegistry.deploy(
    tpnToken.address,    // _tpnTokenAddress
    badgeNFT.address,    // _badgeNFTAddress
    deployer.address     // _customOwner (retain ownership until DAO migration)
  );
  await tokenRegistry.deployed();
  console.log("🗃️ TokenRegistry deployed to:", tokenRegistry.address);

  // ============================================================================
  // 🔒 Ownership Transfer (Optional)
  // ============================================================================
  // Uncomment when ready for DAO control:
  // await tpnToken.transferOwnership(tokenRegistry.address);
  // await badgeNFT.transferOwnership(tokenRegistry.address);
  // console.log("🔒 Ownership of TPNToken and BadgeNFT transferred to TokenRegistry");

  console.log("🎯 All contracts deployed successfully.");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});









































