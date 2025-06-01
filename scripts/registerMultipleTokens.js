const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const registryAddress = "0x63da75aB40f2271A6ecF99ac7363d9c44f8135Ba"; // Sepolia TokenRegistry
  const TokenRegistry = await ethers.getContractAt("TokenRegistry", registryAddress);

  const tokens = [
    { name: "AlphaCoin", symbol: "ALP" },
    { name: "BetaToken", symbol: "BET" },
    { name: "GammaUSD", symbol: "GUSD" },
  ];

  for (const token of tokens) {
    const bytecode = "0x6080604052348015600f57600080fd5b50604a80601d6000396000f3fe602a60005260206000f3";
    const bytecodeHash = ethers.utils.keccak256(bytecode);
    const symbolBytes32 = ethers.utils.formatBytes32String(token.symbol);

    try {
      await TokenRegistry.callStatic.registerToken(token.name, symbolBytes32, bytecodeHash);
      const tx = await TokenRegistry.registerToken(token.name, symbolBytes32, bytecodeHash);
      await tx.wait();
      console.log(`✅ Registered: ${token.name} (${token.symbol})`);
    } catch (err) {
      console.log(`❌ Failed to register ${token.name}: ${err.reason || err.message}`);
    }
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
