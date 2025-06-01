const { ethers } = require("hardhat");

async function main() {
  const registryAddress = "0x63da75aB40f2271A6ecF99ac7363d9c44f8135Ba"; // Sepolia TokenRegistry
  const TokenRegistry = await ethers.getContractAt("TokenRegistry", registryAddress);

  const tokens = await TokenRegistry.getAllTokens();
  console.log(`📦 Total Registered Tokens: ${tokens.length}\n`);

  for (const address of tokens) {
    const info = await TokenRegistry.getTokenInfo(address);
    const name = info[0];
    const symbol = ethers.utils.parseBytes32String(info[1]);
    const hash = info[2];

    console.log(`🔹 Token: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Hash: ${hash}`);
    console.log(`   Verified Address: ${address}`);
    console.log("---");
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
