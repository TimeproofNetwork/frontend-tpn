const { ethers } = require("hardhat");

async function main() {
  const TPN_TOKEN = "0xA7e3976928332e90DE144f6d4c6393B64E37bf6C";    // ✅ TPN Token Contract
  const recipient = "0x0B7477072b7c06c1dcf4139DBA60A9f78B660719";    // 🔑 Replace with actual recipient
  const amount = ethers.utils.parseUnits("100", 18);           // ✅ Amount: 100 TPN (adjust as needed)

  const [deployer] = await ethers.getSigners();                      // 💳 Your wallet (must hold TPN)
  const token = await ethers.getContractAt("TPNToken", TPN_TOKEN);

  console.log(`⏳ Sending 100 TPN to ${recipient}...`);
  const tx = await token.transfer(recipient, amount);
  await tx.wait();
  console.log(`✅ Successfully sent 100 TPN to ${recipient}`);
  console.log(`📦 Tx Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
