const { ethers } = require("hardhat");

async function main() {
  const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";    // ✅ TPN Token Contract
  const recipient = "USER_WALLET_ADDRESS_HERE";                        // 🔑 Replace with actual recipient
  const amount = ethers.utils.parseUnits("100", 18);                   // ✅ Amount: 100 TPN (adjust as needed)

  const [deployer] = await ethers.getSigners();                        // 💳 Your wallet (must hold TPN)
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
