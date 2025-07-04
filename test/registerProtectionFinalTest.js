// registerProtectionFinalTest.js

const { ethers } = require("hardhat");
const { expect } = require("chai");

async function deployTPNToken(name, symbol, decimals = 18, supply = 1000000) {
  const TPNToken = await ethers.getContractFactory("TPNToken");
  const [owner] = await ethers.getSigners();
  const token = await TPNToken.deploy(name, symbol, decimals, supply, owner.address);
  await token.deployed();
  return token;
}

async function registerToken(registry, token, name, symbol) {
  const tx = await registry.registerToken(
    token.address,
    name,
    ethers.utils.formatBytes32String(symbol)
  );
  return tx.wait();
}

describe("🛡️ GPPB & Scam Protection Test - 8 Token Block", function () {
  let registry;

  before(async () => {
    const registryAddress = "0x6d534d6024da19975098006421A96d7C4fBD40D7"; // Update if needed
    registry = await ethers.getContractAt("TokenRegistry", registryAddress);
  });

  const gppbCases = [
    { name: "Raydium", symbol: "RAY" },
    { name: "Grass", symbol: "GRASS" },
    { name: "The Sandbox", symbol: "SAND" },
    { name: "GALA", symbol: "GALA" }
  ];

  const scamCases = [
    { name: "AppleCoin", symbol: "APL" }, // Global Ban
    { name: "Zzzzzzzzz", symbol: "ZZZ" }, // Spam
    { name: "Solana", symbol: "SOL" },    // Fingerprint
    { name: "XRP", symbol: "XRP" }         // Duplicate
  ];

  [...gppbCases, ...scamCases].forEach(({ name, symbol }) => {
    it(`Should BLOCK ${name} (${symbol}) from registering (Protection Enforced)`, async () => {
      const token = await deployTPNToken(name, symbol);

      let blocked = false;
      try {
        await registerToken(registry, token, name, symbol);
      } catch (err) {
        blocked = true;
        console.log(`🛡 BLOCKED as expected: ${name} (${symbol})`);
      }
      if (!blocked) throw new Error(`❌ ERROR: ${name} (${symbol}) should have been BLOCKED!`);
    });
  });
});


