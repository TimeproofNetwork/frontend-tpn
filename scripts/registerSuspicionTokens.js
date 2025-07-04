// scripts/registerTimeproofAttackTest.js

const { ethers } = require("hardhat");

// ✅ Final deployed addresses
const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

// 🛡️ Timeproof Attack Test Tokens (Triggering SC Only)
const TOKENS = [
  { name: "Tim3profNetworrk", symbol: "TNPN" },         // ✅ Root token (LSIC: symbol >3)
  { name: "Tim3profNetworrrk", symbol: "TNPN" },        // ✅ LSIC → extra 'r'
  { name: "Tim3profNetworqk", symbol: "TNPN" },         // ✅ LSIC → typo 'q' for 'k'
  { name: "Tim3pr0fNetworrk", symbol: "TNPN" },         // ✅ LSIC → 'o' → '0'
  { name: "Tim3proffNetworrk", symbol: "TNPN" },        // ✅ LSIC → doubled 'f'
  { name: "Tim3profNetworrks", symbol: "TNPN" }         // ✅ LSIC → added 's'
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔐 Using deployer:", deployer.address);

  const TPN = await ethers.getContractAt("TPNToken", TPN_TOKEN, deployer);
  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY, deployer);

  const mintTx = await TPN.mint(deployer.address, ethers.utils.parseUnits("2000", 18));
  await mintTx.wait();
  console.log("✅ Minted 2000 TPN to deployer");

  const approveTx = await TPN.approve(TOKEN_REGISTRY, ethers.utils.parseUnits("2000", 18));
  await approveTx.wait();
  console.log("✅ Approved 2000 TPN to TokenRegistry");

  for (const t of TOKENS) {
    console.log(`\n⏳ Deploying new token: "${t.name}" (${t.symbol})...`);

    const Token = await ethers.getContractFactory("TPNToken", deployer);
    const deployed = await Token.deploy(
      t.name,
      t.symbol,
      18,
      ethers.utils.parseUnits("1000000", 18),
      deployer.address
    );
    await deployed.deployed();

    console.log(`📌 Deployed Token: "${t.name}" at: ${deployed.address}`);

    try {
      const gasEstimate = await Registry.estimateGas.registerToken(
        t.name,
        t.symbol,
        deployed.address,
        1
      );

      const tx = await Registry.registerToken(
        t.name,
        t.symbol,
        deployed.address,
        1,
        {
          gasLimit: gasEstimate.add(ethers.BigNumber.from("100000")),
          maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),
          maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei")
        }
      );

      await tx.wait(1);
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

    await sleep(2000);
  }

  const final = await TPN.balanceOf(deployer.address);
  console.log("🔎 Final TPN Balance:", ethers.utils.formatUnits(final, 18));
}

main().catch((error) => {
  console.error("❌ Script Failed:", error);
  process.exit(1);
});



























































































