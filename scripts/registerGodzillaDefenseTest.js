// scripts/registerTimeproofAttackTest.js

const { ethers } = require("hardhat");

// ✅ Final deployed addresses
const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";
const BADGE_NFT = "0x0C163CA2bca11405e0973145159B39Ea4DB6C1b2";
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

// 🛡️ Timeproof Attack Test Tokens
const TOKENS = [
  { name: "RocketPool", symbol: "RPL" },     // ≈ #80
  { name: "Aave", symbol: "AAVE" },          // ≈ #81
  { name: "Fantom", symbol: "FTM" },         // ≈ #82
  { name: "Tezos", symbol: "XTZ" },          // ≈ #83
  { name: "Stacks", symbol: "STX" },         // ≈ #84
  { name: "LidoDAO", symbol: "LDO" }         // ≈ #85
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔐 Using deployer:", deployer.address);

  const TPN = await ethers.getContractAt("TPNToken", TPN_TOKEN, deployer);
  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY, deployer);

  // ✅ Mint 2000 TPN to self (skip this if already minted)
  const mintTx = await TPN.mint(deployer.address, ethers.utils.parseUnits("2000", 18));
  await mintTx.wait();
  console.log("✅ Minted 2000 TPN to deployer");

  // ✅ Approve 2000 TPN (skip this if already approved)
  const approveTx = await TPN.approve(TOKEN_REGISTRY, ethers.utils.parseUnits("2000", 18));
  await approveTx.wait();
  console.log("✅ Approved 2000 TPN to TokenRegistry");

  for (const t of TOKENS) {
    console.log(`\n⏳ Registering: "${t.name}" (${t.symbol})...`);

    try {
      const gasEstimate = await Registry.estimateGas.registerToken(
        t.name,
        t.symbol,
        EXISTING_TOKEN,
        1
      );

      const tx = await Registry.registerToken(
        t.name,
        t.symbol,
        EXISTING_TOKEN,
        1,
        {
          gasLimit: gasEstimate.add(ethers.BigNumber.from("100000")), // ✅ Safe buffer
          maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),        // ✅ Safe Sepolia
          maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei")  // ✅ Fast enough
        }
      );

      await tx.wait(1);  // ✅ Only wait 1 block
      console.log(`✅ Registered & Badge Minted: "${t.name}" (${t.symbol})`);

    } catch (err) {
      const reason =
        err?.error?.message ||
        err?.reason ||
        err?.data?.message ||
        err.message ||
        "Unknown";
      console.log(`❌ Rejected: "${t.name}" (${t.symbol})\n   Reason: ${reason}`);
    }

    await sleep(2000);  // ✅ Faster cycle
  }

  const final = await TPN.balanceOf(deployer.address);
  console.log("🔎 Final TPN Balance:", ethers.utils.formatUnits(final, 18));
}

main().catch((error) => {
  console.error("❌ Script Failed:", error);
  process.exit(1);
});


































