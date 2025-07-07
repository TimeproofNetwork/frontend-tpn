// scripts/simulateDAOPauseRegistry.js

const { ethers } = require("hardhat");

// ✅ Final Deployed Addresses
const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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
