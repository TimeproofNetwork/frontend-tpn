// scripts/registerFreshFiveTokens.js

const { ethers } = require("hardhat");
const registryABI = require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;

// ✅ Final deployed addresses
const TPN_TOKEN = "0xA7e3976928332e90DE144f6d4c6393B64E37bf6C";
const BADGE_NFT = "0x49A5f62fEb8ADd7323cc14a205a60608378c1D75";
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🛡️ Timeproof Attack Test Tokens (Fingerprint Clones)
const TOKENS = [
  { name: "MapleReserve", symbol: "mpr" },
  { name: "DeltaCarbon", symbol: "dlc" },
  { name: "OrbitVerse", symbol: "ovr" },
  { name: "QuantumMint", symbol: "qtm" }
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
        "",     // proof1: empty
        ""      // proof2: empty
      );

      const tx = await Registry.registerToken(
        t.name,
        t.symbol,
        deployed.address,
        "",     // proof1
        "",     // proof2
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








