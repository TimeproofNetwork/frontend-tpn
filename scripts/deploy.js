const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // 1. Deploy FakeToken
  const FakeToken = await ethers.getContractFactory("FakeToken");
  const fakeToken = await FakeToken.deploy("Timeproof Network", "TPN", 18);
  await fakeToken.deployed();
  console.log(`✅ FakeToken deployed at: ${fakeToken.address}`);

  // 2. Deploy TokenRegistry
  const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
  const registry = await TokenRegistry.deploy(fakeToken.address);
  await registry.deployed();
  console.log(`✅ TokenRegistry deployed at: ${registry.address}`);

  // 3. Mint 1000 TPN to deployer
  const mintAmount = ethers.utils.parseUnits("1000", 18);
  const mintTx = await fakeToken.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log(`✅ Minted 1000 TPN to ${deployer.address}`);

  // 4. Approve 100 TPN to TokenRegistry
  const approveAmount = ethers.utils.parseUnits("100", 18);
  const approveTx = await fakeToken.approve(registry.address, approveAmount);
  await approveTx.wait();
  console.log(`✅ Approved 100 TPN to TokenRegistry`);

  // 5. Log balance & allowance
  const balance = await fakeToken.balanceOf(deployer.address);
  const allowance = await fakeToken.allowance(deployer.address, registry.address);
  console.log(`📊 Balance: ${ethers.utils.formatUnits(balance, 18)} TPN`);
  console.log(`📊 Allowance: ${ethers.utils.formatUnits(allowance, 18)} TPN`);

  // 6. Register a token
  const name = "MyToken";
  const symbol = ethers.utils.formatBytes32String("MTK");

  const dummyBytecode = "0x6080604052348015600f57600080fd5b50604a80601d6000396000f3fe602a60005260206000f3";
  const bytecodeHash = ethers.utils.keccak256(dummyBytecode);

  // Optional dry-run using callStatic
  try {
    await registry.callStatic.registerToken(name, symbol, bytecodeHash);
    const tx = await registry.registerToken(name, symbol, bytecodeHash);
    await tx.wait();
    console.log("✅ Token registered successfully 🎉");
  } catch (error) {
    console.error("❌ Token registration failed:", error.reason || error.message);
  }
}

main().catch((error) => {
  console.error(`❌ Deployment script failed:`, error);
  process.exitCode = 1;
});
















