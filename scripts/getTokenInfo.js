const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
  const tokenAddress = process.env.TOKEN;
  const registryAddress = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6"; // ✅ Replace with your registry address

  if (!tokenAddress) {
    throw new Error("❌ TOKEN address not provided via environment variable");
  }

  console.log(`\n🔍 Fetching token info for address: ${tokenAddress}...\n`);

  // ✅ Load the full artifact and extract the ABI
  const artifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../frontend-tpn/abi/TokenRegistry.json"),
      "utf8"
    )
  );
  const abi = artifact.abi; // ✅ FIXED: extract just the ABI array

  const registry = await ethers.getContractAt(abi, registryAddress);

  const info = await registry.getTokenInfo(tokenAddress);

  console.log("✅ Token Info:");
  console.log(`   🏷️ Name:            ${info[0]}`);
  console.log(`   🔣 Symbol:          ${info[1]}`);
  console.log(`   📦 Address:         ${info[2]}`);
  console.log(`   👤 Registered By:   ${info[3]}`);
  console.log(`   🕒 Timestamp:       ${new Date(info[4] * 1000).toLocaleString()}`);
  console.log(`   🔗 Proof1:          ${info[5]}`);
  console.log(`   🔗 Proof2:          ${info[6]}`);
  console.log(`   🔒 Trust Level:     Level ${info[7]}`);
  console.log(`   📌 Is Registered:   ${info[8]}`);
  console.log(`   🆙 Upgrade Pending: ${info[9]}`);
}

main().catch((error) => {
  console.error(`❌ Script error:`, error);
});






