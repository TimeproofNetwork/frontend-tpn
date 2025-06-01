
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenRegistry", function () {
  it("registers a token with minimum fee", async function () {
    const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
    const registry = await TokenRegistry.deploy();
    await registry.deployed();

    const [user] = await ethers.getSigners();
    const fee = ethers.utils.parseEther("100");

    await expect(
      registry.registerToken("FAKETOKEN", { value: fee })
    ).to.emit(registry, "TokenRegistered").withArgs(user.address, "FAKETOKEN", fee);
  });
});
