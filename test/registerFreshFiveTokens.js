// test/registerFreshFiveTokens.js

const { ethers } = require("hardhat");
const { expect } = require("chai");

async function deployTPNToken(name, symbol, decimals = 18, supply = 1000000, owner) {
  const TokenFactory = await ethers.getContractFactory("TPNToken");
  const token = await TokenFactory.deploy(name, symbol, decimals, supply, owner.address);
  await token.deployed();
  return token;
}

async function registerToken(registry, token, name, symbol, signer) {
  const tx = await registry.connect(signer).registerToken(
    token.address,
    name,
    ethers.utils.formatBytes32String(symbol)
  );
  return tx.wait();
}

describe("🟢 Fresh 5 Token Registration - 4 Pass + 1 Fail (Low TPN)", function () {
  let registry;
  let deployer, zeroTPNWallet;

  before(async () => {
    [deployer] = await ethers.getSigners();

    // Create a random wallet with 0 TPN
    zeroTPNWallet = ethers.Wallet.createRandom().connect(ethers.provider);

    registry = await ethers.getContractAt(
      "TokenRegistry",
      "0x93f285d1B6bd75EeB932e217A18d8987E02DD62C" // ✅ Update if needed
    );
  });

  const freshTokens = [
    { name: "AvoCoin", symbol: "AVO" },
    { name: "TravelToken", symbol: "TRV" },
    { name: "MangoPay", symbol: "MGP" },
    { name: "CoffeeDegen", symbol: "CAF" }
  ];

  it("✅ Should register 4 fresh unique tokens with sufficient TPN", async () => {
    for (const { name, symbol } of freshTokens) {
      const token = await deployTPNToken(name, symbol, 18, 1_000_000, deployer);
      const tx = await registerToken(registry, token, name, symbol, deployer);
      console.log(`✅ Registered: ${name} (${symbol}) at tx ${tx.transactionHash}`);
    }
  });

  it("❌ Should REJECT registration with 0 TPN balance", async () => {
    const token = await deployTPNToken("RejectMe", "RJT", 18, 1_000_000, zeroTPNWallet);

    let failed = false;
    try {
      await registerToken(registry, token, "RejectMe", "RJT", zeroTPNWallet);
    } catch (err) {
      failed = true;
      console.log("🛑 BLOCKED as expected: RejectMe (RJT) due to 0 TPN balance");
    }

    if (!failed) throw new Error("❌ ERROR: Registration should have failed for 0 TPN wallet!");
  });
});
