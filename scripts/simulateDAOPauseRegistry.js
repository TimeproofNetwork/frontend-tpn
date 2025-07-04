// scripts/simulateDAOPauseRegistry.js

const { ethers } = require("hardhat");

// ✅ Final Deployed Addresses
const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

// 🧪 Token Metadata to Test Registration During Pause
const testToken = {
  name: "pausetestcoin",
  symbol: "ptc",
  decimals: 18,
  initialSupply: ethers.utils.parseUnits("1000", 18),
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  console.log("🔐 Connected as DAO:", deployer.address);

  // ✅ Step 1: Pause the Registry
  const pauseTx = await registry.pauseRegistry();
  await pauseTx.wait();
  console.log("⏸️ DAO has paused the registry.");

  // ✅ Step 2: Deploy a fresh token to attempt registration
  const TokenFactory = await ethers.getContractFactory("TPNToken");
  const token = await TokenFactory.deploy(
    testToken.name,
    testToken.symbol,
    testToken.decimals,
    testToken.initialSupply,
    deployer.address
  );
  await token.deployed();
  console.log(`📦 Deployed Token: ${testToken.name} (${testToken.symbol}) at ${token.address}`);

  // ✅ Step 3: Approve 1000 TPN to the Registry
  const tpn = await ethers.getContractAt("TPNToken", TPN_TOKEN);
  const approveTx = await tpn.approve(TOKEN_REGISTRY, ethers.utils.parseUnits("1000", 18));
  await approveTx.wait();
  console.log("✅ Approved 1000 TPN to TokenRegistry");

  // ✅ Step 4: Attempt Registration — Should Fail
  try {
    const registerTx = await registry.registerToken(
      testToken.name,
      testToken.symbol,
      token.address,
      1 // Trust Level: 1
    );
    await registerTx.wait();
    console.log("❌ Unexpected: Token registered while registry was paused!");
  } catch (err) {
    console.log("✅ Registration blocked as expected while paused:", err.reason || err.message);
  }

  // ✅ Final Check
  const isPaused = await registry.paused();
  console.log("🔍 Registry Paused State:", isPaused);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
